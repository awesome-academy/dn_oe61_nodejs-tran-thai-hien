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
  Space,
  SpacePriceUnit,
  Venue,
  VenueStatus,
} from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { SortDirection } from 'src/common/enums/query.enum';
import { StatusKey } from 'src/common/enums/status-key.enum';
import {
  getErrorMessageSendMail,
  logAndThrowPrismaClientError,
} from 'src/common/helpers/catch-error.helper';
import { queryWithPagination } from 'src/common/helpers/paginate.helper';
import { ParseSingleSort } from 'src/common/helpers/parse-sort';
import { getUserOrFail } from 'src/common/helpers/user.helper';
import { BaseResponse } from 'src/common/interfaces/base-response';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from 'src/common/interfaces/paginate-type';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { buildBaseResponse } from 'src/common/utils/data.util';
import { convertTimeToDate, isSameDay } from 'src/common/utils/date.util';
import { BookingStatusPayloadDto } from 'src/mail/dto/booking-confirmed-payload.dto';
import { BookingRequestPayloadDto } from 'src/mail/dto/booking-request-payload.dto';
import { MailException } from 'src/mail/exceptions/mail.exception';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SEND_MAIL_STATUS } from 'src/user/constant/email.constant';
import {
  INCLUDE_BOOKING_INFO,
  INCLUDE_BOOKING_SUMMARY,
  INCLUDE_PAYLOAD_EMAIL_BOOKING,
} from './constants/include.constant';
import { DEFAULT_REJECTION_REASON } from './constants/reason.constant';
import { BookingCreationRequestDto } from './dto/requests/booking-creation-request.dto';
import { BookingFilterRequestDto } from './dto/requests/booking-filter-request.dto';
import { BookingInfoResponse } from './dto/responses/booking-info.response';
import { BookingSummaryResponseDto } from './dto/responses/booking-summary-response.dto';
import { BookingInfoType } from './interfaces/booking-summary.type';

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
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const spaceDetail = await this.prismaService.space.findUnique({
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
    if (!spaceDetail)
      throw new NotFoundException(
        this.i18nService.translate('common.space.notFound'),
      );
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (start >= end)
      throw new BadRequestException(
        this.i18nService.translate('common.booking.invalidTime'),
      );
    this.validateBookingHours(
      start,
      end,
      spaceDetail.openHour,
      spaceDetail.closeHour,
    );
    const priceByUnit = spaceDetail.spacePrices.find(
      (sp) => sp.unit == dto.unitPrice,
    );
    if (!priceByUnit)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.unitPriceNotFound'),
      );
    const totalPrice = this.calculateBookingPrice(
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
      user: { connect: { id: userDetail.id } },
      space: { connect: { id: userDetail.id } },
      startTime: start,
      endTime: end,
      totalPrice: totalPrice,
    };
    const newBooking = await this.prismaService.booking.create({
      data: bookingData,
      include: INCLUDE_BOOKING_SUMMARY,
    });
    const payloadEmail: BookingRequestPayloadDto = {
      to: userDetail.email,
      booking: newBooking,
    };
    const statusSendMail = await this.sendBookingMail(() =>
      this.mailService.sendBookingRequest(payloadEmail),
    );
    const statusKey =
      statusSendMail === SEND_MAIL_STATUS.SENT
        ? StatusKey.SUCCESS
        : StatusKey.SEND_MAIL_FAILED;
    return buildBaseResponse(
      statusKey,
      this.buildBookingSummaryDto(newBooking, priceByUnit.unit),
    );
  }
  async confirmBooking(
    bookingId: number,
  ): Promise<BaseResponse<BookingSummaryResponseDto>> {
    const bookingDetail = await this.prismaService.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (!bookingDetail)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.notFound'),
      );
    if (bookingDetail?.status === BookingStatus.CONFIRMED)
      return buildBaseResponse(StatusKey.UNCHANGED);
    try {
      const { confirmedBooking, overlappingBookings } =
        await this.prismaService.$transaction(async (tx) => {
          const conflictBooking = await tx.booking.findFirst({
            where: this.buildRequestCheckOverlap(
              bookingDetail,
              BookingStatus.CONFIRMED,
            ),
          });
          if (conflictBooking)
            throw new ConflictException(
              this.i18nService.translate(
                'common.booking.timeSlotAlreadyBooked',
              ),
            );
          const confirmedBooking = await this.prismaService.booking.update({
            where: {
              id: bookingDetail.id,
            },
            data: {
              status: BookingStatus.CONFIRMED,
            },
            include: INCLUDE_PAYLOAD_EMAIL_BOOKING,
          });
          const overlappingBookings = await tx.booking.findMany({
            where: this.buildRequestCheckOverlap(
              bookingDetail,
              BookingStatus.PENDING,
            ),
            include: { user: true, space: true },
          });
          await tx.booking.updateMany({
            where: { id: { in: overlappingBookings.map((b) => b.id) } },
            data: { status: 'REJECTED' },
          });
          return { confirmedBooking, overlappingBookings };
        });
      const payloadConfirmedEmail: BookingStatusPayloadDto = {
        to: confirmedBooking.user.email,
        booking: confirmedBooking,
      };
      await this.sendBookingMail(() =>
        this.mailService.sendBookingConfirmedMail(payloadConfirmedEmail),
      );
      for (const booking of overlappingBookings) {
        const payloadRejectedEmail: BookingStatusPayloadDto = {
          to: booking.user.email,
          booking: booking,
          reason: DEFAULT_REJECTION_REASON,
        };
        await this.sendBookingMail(() =>
          this.mailService.sendBookingRejectedMail(payloadRejectedEmail),
        );
      }
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildBookingSummaryDto(confirmedBooking),
      );
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        BookingService.name,
        'booking',
        'confirmBooking',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async rejectBooking(
    bookingId: number,
  ): Promise<BaseResponse<BookingSummaryResponseDto>> {
    const bookingDetail = await this.prismaService.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (!bookingDetail)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.notFound'),
      );
    if (bookingDetail.status === BookingStatus.REJECTED)
      return buildBaseResponse(StatusKey.UNCHANGED);
    try {
      const bookingUpdated = await this.prismaService.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BookingStatus.REJECTED,
        },
        include: INCLUDE_PAYLOAD_EMAIL_BOOKING,
      });
      const payloadRejectedEmail: BookingStatusPayloadDto = {
        to: bookingUpdated.user.email,
        booking: bookingUpdated,
        reason: DEFAULT_REJECTION_REASON,
      };
      await this.sendBookingMail(() =>
        this.mailService.sendBookingRejectedMail(payloadRejectedEmail),
      );
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildBookingSummaryDto(bookingUpdated),
      );
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        BookingService.name,
        'booking',
        'rejectBooking',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async findBookingHistory(
    currentUser: AccessTokenPayload,
    query: QueryParamDto,
  ): Promise<PaginationResult<BookingInfoResponse>> {
    const user = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const { page, pageSize, sortBy, direction } = query;
    const fieldsValidEnum = Prisma.BookingScalarFieldEnum;
    const sortFieldsValid = Object.values(fieldsValidEnum) as readonly string[];
    const fieldDefault = fieldsValidEnum.startTime;
    const sort = ParseSingleSort(
      sortFieldsValid,
      fieldDefault,
      direction,
      sortBy,
    );
    const paginationParams: PaginationParams = {
      page,
      pageSize,
    };
    const queryOptions = {
      where: {
        userId: user.id,
      },
      include: INCLUDE_BOOKING_INFO,
      orderBy: sort,
    };
    return this.getPaginatedBookings(
      paginationParams,
      queryOptions,
      'findBookingHistory',
    );
  }
  async findSpaceBookingStates(
    currentUser: AccessTokenPayload,
    filter: BookingFilterRequestDto,
  ) {
    const user = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const { page, pageSize, sortBy, direction } = filter;
    const fieldsValidEnum = Prisma.BookingScalarFieldEnum;
    const sortFieldsValid = Object.values(fieldsValidEnum) as readonly string[];
    const fieldDefault = fieldsValidEnum.startTime;
    const sort = ParseSingleSort(
      sortFieldsValid,
      fieldDefault,
      direction,
      sortBy,
    );
    const paginationParams: PaginationParams = {
      page,
      pageSize,
    };
    const queryOptions = this.buildBookingsQuery(filter, sort, {
      space: {
        spaceManagers: {
          some: {
            managerId: user.id,
          },
        },
      },
    });
    return this.getPaginatedBookings(
      paginationParams,
      queryOptions,
      'findSpaceBookingStates',
    );
  }
  async findBookings(
    filter: BookingFilterRequestDto,
  ): Promise<PaginationResult<BookingInfoResponse>> {
    const { page, pageSize, sortBy, direction } = filter;
    const fieldsValidEnum = Prisma.BookingScalarFieldEnum;
    const sortFieldsValid = Object.values(fieldsValidEnum) as readonly string[];
    const fieldDefault = fieldsValidEnum.startTime;
    const sort = ParseSingleSort(
      sortFieldsValid,
      fieldDefault,
      direction,
      sortBy,
    );
    const paginationParams: PaginationParams = {
      page,
      pageSize,
    };
    const queryOptions = this.buildBookingsQuery(filter, sort, null);
    return this.getPaginatedBookings(
      paginationParams,
      queryOptions,
      'findBookings',
    );
  }
  private calculateBookingPrice(
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
  private buildBookingsQuery(
    filter: BookingFilterRequestDto,
    sort: Record<string, SortDirection>,
    conditionExtras: Record<string, unknown> | null,
  ) {
    const queryFilters = {
      where: {
        ...(filter?.spaceName && {
          space: {
            name: { contains: filter.spaceName },
          },
        }),
        ...(filter.startDate &&
          filter.endDate && {
            startTime: { gte: filter.startDate, lte: filter.endDate },
          }),
        ...(!filter.endDate &&
          filter.startDate && {
            startTime: { gte: filter.startDate },
          }),
        ...(!filter.startDate &&
          filter.endDate && {
            startTime: { lte: filter.endDate },
          }),
        ...conditionExtras,
      },
      include: INCLUDE_BOOKING_INFO,
      orderBy: sort,
    };
    return queryFilters;
  }
  private buildRequestCheckOverlap(booking: Booking, status: BookingStatus) {
    return {
      spaceId: booking.spaceId,
      status: status,
      startTime: { lt: booking.endTime },
      endTime: { gt: booking.startTime },
      NOT: { id: booking.id },
    };
  }
  private async sendBookingMail(mailFn: () => Promise<void>) {
    try {
      await mailFn();
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
  private async getPaginatedBookings(
    paginationParams: PaginationParams,
    options: FindOptions,
    functionName: string,
  ): Promise<PaginationResult<BookingInfoResponse>> {
    try {
      const spaces = await queryWithPagination(
        this.prismaService.booking,
        paginationParams,
        options,
      );
      return {
        ...spaces,
        data: spaces.data.map((v: BookingInfoType) =>
          this.buildBookingInfoDto(v),
        ),
      };
    } catch (exception) {
      logAndThrowPrismaClientError(
        exception as Error,
        BookingService.name,
        'booking',
        functionName,
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
  private buildBookingSummaryDto(
    data: Booking & { user: OwnerLite; space: SpaceLite },
    unit?: SpacePriceUnit,
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
  private buildBookingInfoDto(
    data: Booking & { user?: OwnerLite; space: Space & { venue: Venue } },
  ): BookingInfoResponse {
    const address = `${data.space.venue.street} - ${data.space.venue.city}`;
    return {
      id: data.id,
      space: {
        id: data.space.id,
        name: data.space.name,
        type: data.space.type,
        venueName: data.space.venue.name,
        address: address,
      },
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      totalPrice: data.totalPrice,
      user: data.user,
      createdAt: data.createdAt,
    };
  }
}
