import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { EXPIRE_TIME_PAYMENT_DEFAULT } from 'src/common/constants/time.constant';
import { SortDirection } from 'src/common/enums/query.enum';
import { Role } from 'src/common/enums/role.enum';
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
import {
  convertTimeToDate,
  isSameDay,
  parseExpireTime,
} from 'src/common/utils/date.util';
import { BookingStatusPayloadDto } from 'src/mail/dto/booking-confirmed-payload.dto';
import { BookingRejectedPayloadDto } from 'src/mail/dto/booking-rejected-payload.dto';
import { BookingRequestPayloadDto } from 'src/mail/dto/booking-request-payload.dto';
import { MailException } from 'src/mail/exceptions/mail.exception';
import { MailService } from 'src/mail/mail.service';
import { PaymentCreationRequestDto } from 'src/payment/dto/requests/payment-creation-request.dto';
import { PayOSCreatePaymentResponseDto } from 'src/payment/dto/responses/payos-creation-response.dto';
import { PaymentCreationException } from 'src/payment/exceptions/payment-creation-exception';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SEND_MAIL_STATUS } from 'src/user/constant/email.constant';
import { BookingPublisher } from './booking-publisher';
import {
  INCLUDE_BOOKING_INFO,
  INCLUDE_BOOKING_SUMMARY,
  INCLUDE_PAYLOAD_EMAIL_BOOKING,
} from './constants/include.constant';
import { DEFAULT_REJECTION_REASON } from './constants/reason.constant';
import { BookingCreationRequestDto } from './dto/requests/booking-creation-request.dto';
import { BookingFilterRequestDto } from './dto/requests/booking-filter-request.dto';
import { BookingRejectRequestDto } from './dto/requests/booking-reject-request.dto';
import { PaymentQueuePayloadDto } from './dto/requests/payment-queu-payload.dto';
import { BookingInfoResponse } from './dto/responses/booking-info.response';
import { BookingSummaryResponseDto } from './dto/responses/booking-summary-response.dto';
import { BookingInfoType } from './interfaces/booking-summary.type';
import { BookingCancelPayloadDto } from './dto/requests/booking-cancel-payload';
import { NotificationPublisher } from 'src/notification/notification-publisher';
import { BookingStatusNotiPayload } from 'src/notification/dto/payloads/create-booking-noti-payload';
import { buildDataRange } from 'src/common/helpers/prisma.helper';
import { BookingStatusCountDto } from './dto/responses/bookig-status-count.response';

@Injectable()
export class BookingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly i18nService: I18nService,
    private readonly mailService: MailService,
    private readonly paymentService: PaymentService,
    private readonly bookingPublisher: BookingPublisher,
    private readonly notificationPublisher: NotificationPublisher,
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
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
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
      space: { connect: { id: spaceDetail.id } },
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
    const payloadCreatedBookingNotify: BookingStatusNotiPayload = {
      bookingId: newBooking.id,
      ownerName: newBooking.user.name,
      spaceName: newBooking.space.name,
      startDate: newBooking.startTime,
      endDate: newBooking.endTime,
      createdAt: newBooking.createdAt,
      type: BookingStatus.PENDING,
    };
    this.notificationPublisher.publishBookingCreated(
      payloadCreatedBookingNotify,
    );
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
      include: {
        space: true,
      },
    });
    if (!bookingDetail)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.notFound'),
      );
    if (bookingDetail?.status === BookingStatus.CONFIRMED)
      return buildBaseResponse(StatusKey.UNCHANGED);
    const expireTime = this.configService.get<string>(
      'payOS.expireTime',
      EXPIRE_TIME_PAYMENT_DEFAULT,
    );
    const expireSeconds = parseExpireTime(expireTime);
    const expiredAt = Math.floor(Date.now() / 1000) + expireSeconds;
    const paymentPayload: PaymentCreationRequestDto = {
      amount: bookingDetail.totalPrice,
      bookingId: bookingDetail.id,
      userId: bookingDetail.userId,
      description: `PAY FOR BOOKING-${bookingDetail.id}`,
      expiredAt: expiredAt,
    };
    let paymentData: PayOSCreatePaymentResponseDto;
    try {
      paymentData = await this.paymentService.create(paymentPayload);
    } catch (error) {
      if (error instanceof PaymentCreationException) {
        throw new BadRequestException(
          'Tạo link thanh toán thất bại, vui lòng thử lại',
        );
      }
      throw error;
    }
    try {
      const { confirmedBooking, overlappingBookings } =
        await this.prismaService.$transaction(async (tx) => {
          const conflictBooking = await tx.booking.findFirst({
            where: this.buildRequestCheckOverlap(bookingDetail, [
              BookingStatus.CONFIRMED,
              BookingStatus.COMPLETED,
            ]),
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
            where: this.buildRequestCheckOverlap(confirmedBooking, [
              BookingStatus.PENDING,
            ]),
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
        paymentLink: paymentData.data.checkoutUrl,
        expiredAt: expiredAt,
      };
      await this.sendBookingMail(() =>
        this.mailService.sendBookingConfirmedMail(payloadConfirmedEmail),
      );
      for (const booking of overlappingBookings) {
        const payloadRejectedEmail: BookingRejectedPayloadDto = {
          to: booking.user.email,
          booking: booking,
          reason: DEFAULT_REJECTION_REASON,
        };
        await this.sendBookingMail(() =>
          this.mailService.sendBookingRejectedMail(payloadRejectedEmail),
        );
      }
      const paymentBookingPayload: PaymentQueuePayloadDto = {
        booking: confirmedBooking,
        expiredAt: expiredAt,
        paymentLink: paymentData.data.checkoutUrl,
      };
      this.bookingPublisher.publishBookingCofirmed(paymentBookingPayload);
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
    dto: BookingRejectRequestDto,
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
      const reason = dto?.reason ? dto.reason : DEFAULT_REJECTION_REASON;
      const payloadRejectedEmail: BookingRejectedPayloadDto = {
        to: bookingUpdated.user.email,
        booking: bookingUpdated,
        reason,
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
    const userDetail = await getUserOrFail(
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
        userId: userDetail.id,
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
    const { page, pageSize, sortBy, direction, statuses } = filter;
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
    const statusesArray: BookingStatus[] = Array.isArray(statuses)
      ? statuses.filter((s): s is BookingStatus => s !== undefined)
      : statuses !== undefined
        ? [statuses]
        : [];
    const conditionsExtra = statuses ? { status: { in: statusesArray } } : {};
    const queryOptions = this.buildBookingsQuery(filter, sort, conditionsExtra);
    return this.getPaginatedBookings(
      paginationParams,
      queryOptions,
      'findBookings',
    );
  }
  async findDetail(
    currentUser: AccessTokenPayload,
    bookingId: number,
  ): Promise<BaseResponse<BookingSummaryResponseDto>> {
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const bookingDetail = await this.prismaService.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        ...INCLUDE_BOOKING_SUMMARY,
        space: {
          select: {
            id: true,
            name: true,
            spaceManagers: true,
          },
        },
      },
    });
    if (!bookingDetail)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.notFound'),
      );
    const isAdminAction = this.validRoleAction(currentUser.role as Role);
    const isOwner = bookingDetail?.userId === userDetail.id;
    const isManager = bookingDetail?.space.spaceManagers.some(
      (manager) => manager.managerId === userDetail.id,
    );
    if (!(isAdminAction || isOwner || isManager))
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    return buildBaseResponse(
      StatusKey.SUCCESS,
      this.buildBookingSummaryDto(bookingDetail),
    );
  }
  async cancelBooking(
    currentUser: AccessTokenPayload,
    bookingId: number,
  ): Promise<BaseResponse<BookingSummaryResponseDto>> {
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const bookingDetail = await this.prismaService.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
    if (!bookingDetail)
      throw new NotFoundException(
        this.i18nService.translate('common.booking.notFound'),
      );
    if (bookingDetail?.userId !== userDetail.id)
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    if (!this.isCancel(bookingDetail.status))
      throw new ConflictException(
        this.i18nService.translate(
          'common.booking.action.cancelBooking.notCancel',
        ),
      );
    try {
      const bookingUpdated = await this.prismaService.booking.update({
        where: {
          id: bookingDetail.id,
        },
        data: {
          status: BookingStatus.CANCELED,
        },
        include: INCLUDE_PAYLOAD_EMAIL_BOOKING,
      });
      const payloadPublisher: BookingCancelPayloadDto = {
        bookingId: bookingUpdated.id,
        userEmail: bookingUpdated.user.email,
        name: bookingUpdated.user.name,
        spaceName: bookingUpdated.space.name,
        startTime: bookingUpdated.startTime,
        endTime: bookingUpdated.endTime,
      };
      this.bookingPublisher.publishCanceledBooking(payloadPublisher);
      const payloadCanceledBookingNotify: BookingStatusNotiPayload = {
        bookingId: bookingUpdated.id,
        ownerName: bookingUpdated.user.name,
        spaceName: bookingUpdated.space.name,
        startDate: bookingUpdated.startTime,
        endDate: bookingUpdated.endTime,
        createdAt: bookingUpdated.createdAt,
        type: BookingStatus.CANCELED,
      };
      this.notificationPublisher.publishBookingCreated(
        payloadCanceledBookingNotify,
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
        'cancelBooking',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async getOwnersAndManagersId(bookingId: number) {
    const bookingById = await this.prismaService.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        space: {
          select: {
            spaceManagers: {
              select: {
                managerId: true,
              },
            },
          },
        },
      },
    });

    if (!bookingById) {
      this.loggerService.error(
        `Fetch OwnerManager Spaces for Notification Failed`,
        `Caused by Booking not found`,
      );
      return null;
    }
    const ownerAndManagersSet = new Set<number>();
    ownerAndManagersSet.add(bookingById.userId);
    bookingById.space.spaceManagers.forEach((m) =>
      ownerAndManagersSet.add(m.managerId),
    );
    return Array.from(ownerAndManagersSet);
  }
  async getBookingStatusCount(
    filter: BookingFilterRequestDto,
  ): Promise<BaseResponse<BookingStatusCountDto>> {
    const { startDate, endDate, spaceName } = filter;
    const filterDate = buildDataRange(startDate, endDate);
    const where = {
      ...(filterDate ? { startTime: filterDate } : {}),
      ...(spaceName ? { space: { name: { contains: spaceName } } } : {}),
    };
    try {
      const results = await this.prismaService.booking.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      });
      const counts = {};
      for (const item of results) {
        counts[item.status] = Number(item._count.status);
      }
      const countsStatusResponse: BookingStatusCountDto = {
        counts,
      };
      return buildBaseResponse(StatusKey.SUCCESS, countsStatusResponse);
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        BookingService.name,
        'booking',
        'getBookingStatusCount',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
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
  private buildRequestCheckOverlap(
    booking: Booking,
    statuses: BookingStatus[],
  ) {
    return {
      spaceId: booking.spaceId,
      status: { in: statuses },
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
      this.loggerService.error('Error Detail:: ', (exception as Error).stack);
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

  private validRoleAction(role: Role): boolean {
    const rolesValid = [Role.MODERATOR, Role.ADMIN];
    return rolesValid.includes(role);
  }
  private isCancel(status: BookingStatus): status is 'PENDING' | 'CONFIRMED' {
    return (
      status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED
    );
  }
}
