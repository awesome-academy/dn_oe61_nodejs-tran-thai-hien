import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Booking,
  BookingStatus,
  Prisma,
  SpacePriceUnit,
  VenueStatus,
} from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { getErrorMessageSendMail } from 'src/common/helpers/catch-error.helper';
import { getUserOrFail } from 'src/common/helpers/user.helper';
import { BaseResponse } from 'src/common/interfaces/base-response';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { buildBaseResponse } from 'src/common/utils/data.util';
import { convertTimeToDate, isSameDay } from 'src/common/utils/date.util';
import { BookingRequestPayloadDto } from 'src/mail/dto/booking-request-payload.dto';
import { MailException } from 'src/mail/exceptions/mail.exception';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SEND_MAIL_STATUS } from 'src/user/constant/email.constant';
import { INCLUDE_BOOKING_SUMMARY } from './constants/include.constant';
import { BookingCreationRequestDto } from './dto/requests/booking-creation-request.dto';
import { BookingSummaryResponseDto } from './dto/responses/booking-summary-response.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly i18nService: I18nService,
    private readonly mailService: MailService,
  ) {}
  async create(
    currentUser: AccessTokenPayload,
    dto: BookingCreationRequestDto,
  ): Promise<BaseResponse<BookingSummaryResponseDto>> {
    const user = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const space = await this.prismaService.space.findUnique({
      where: {
        id: dto.spaceId,
        deletedAt: null,
        venue: {
          status: VenueStatus.APPROVED,
        },
      },
      select: {
        openHour: true,
        closeHour: true,
        id: true,
        spacePrices: true,
      },
    });
    if (!space)
      throw new NotFoundException(
        this.i18nService.translate('common.space.notFound'),
      );
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (start >= end)
      throw new BadRequestException(
        this.i18nService.translate('common.booking.invalidTime'),
      );
    this.validateBookingHours(start, end, space.openHour, space.closeHour);
    const priceByUnit = space.spacePrices.find(
      (sp) => sp.unit == dto.unitPrice,
    );
    if (!priceByUnit)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.unitPriceNotFound'),
      );
    const totalPrice = this.caculateBookingPrice(
      start,
      end,
      dto.unitPrice,
      priceByUnit.price,
    );
    const overlap = await this.prismaService.booking.findFirst({
      where: {
        spaceId: dto.spaceId,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: dto.endTime },
        endTime: { gt: dto.startTime },
      },
    });
    if (overlap)
      throw new ConflictException(
        this.i18nService.translate('common.booking.timeSlotAlreadyBooked'),
      );
    const bookingData: Prisma.BookingCreateInput = {
      user: { connect: { id: user.id } },
      space: { connect: { id: space.id } },
      startTime: start,
      endTime: end,
      totalPrice: totalPrice,
    };
    const newBooking = await this.prismaService.booking.create({
      data: bookingData,
      include: INCLUDE_BOOKING_SUMMARY,
    });
    const payloadEmail: BookingRequestPayloadDto = {
      to: user.email,
      booking: newBooking,
    };
    const statusSendMail = await this.sendRequestBookingMail(payloadEmail);
    const statusKey =
      statusSendMail === SEND_MAIL_STATUS.SENT
        ? StatusKey.SUCCESS
        : StatusKey.SEND_MAIL_FAILED;
    return buildBaseResponse(
      statusKey,
      this.buildBookingSummaryDto(newBooking, priceByUnit.unit),
    );
  }
  private caculateBookingPrice(
    startTime: Date,
    endTime: Date,
    unit: SpacePriceUnit,
    unitPrice: number,
  ) {
    const durationMs = endTime.getTime() - startTime.getTime();
    let blocks = 0;
    switch (unit) {
      case 'HOUR':
        blocks = Math.ceil(durationMs / (1000 * 60 * 60));
        break;
      case 'DAY':
        blocks = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        break;
      case 'MONTH':
        blocks = this.getMonthsBetween(startTime, endTime);
        break;
      default:
        throw new BadRequestException(
          this.i18nService.translate('common.booking.unitPriceNotFound'),
        );
    }
    return blocks * unitPrice;
  }
  private async sendRequestBookingMail(payload: BookingRequestPayloadDto) {
    try {
      await this.mailService.sendBookingRequest(payload);
      return SEND_MAIL_STATUS.SENT;
    } catch (error) {
      let message: string;
      let caused: string | undefined;
      if (error instanceof MailException) {
        message = getErrorMessageSendMail(error.code);
      } else {
        message = 'SEND EMAIL FAILED';
        caused = JSON.stringify(error);
      }
      this.loggerService.error(message, caused, BookingService.name);
      return SEND_MAIL_STATUS.FAILED;
    }
  }
  private buildBookingSummaryDto(
    data: Booking & { user: OwnerLite; space: SpaceLite },
    unit: SpacePriceUnit,
  ): BookingSummaryResponseDto {
    return {
      id: data.id,
      space: data.space,
      user: data.user,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      unit: unit,
      totalPrice: data.totalPrice,
    };
  }
  private getMonthsBetween(start: Date, end: Date): number {
    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (end.getDate() > start.getDate()) {
      months += 1;
    }
    return Math.max(months, 1);
  }
  private validateBookingHours(
    start: Date,
    end: Date,
    openHour: string,
    closeHour: string,
  ) {
    const openHourFirstDay = convertTimeToDate(start, openHour);
    const closeHourLastDay = convertTimeToDate(end, closeHour);
    if (isSameDay(start, end)) {
      if (start < openHourFirstDay || end > closeHourLastDay) {
        throw new BadRequestException(
          this.i18nService.translate('common.booking.outOfWorkingHours'),
        );
      }
      return;
    }
    if (start < openHourFirstDay) {
      throw new BadRequestException(
        this.i18nService.translate('common.booking.earliestStartTime', {
          args: {
            time: openHour,
          },
        }),
      );
    }
    if (end > closeHourLastDay) {
      throw new BadRequestException(
        this.i18nService.translate('common.booking.latestEndTime', {
          args: {
            time: closeHour,
          },
        }),
      );
    }
  }
}
