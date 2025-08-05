import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentMethod, Prisma } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { instanceToPlain } from 'class-transformer';
import * as crypto from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { BookingPublisher } from 'src/booking/booking-publisher';
import { PaymentPaidPayloadDto } from 'src/booking/dto/requests/payment-paid-payload';
import { SortAndPaginationParamDto } from 'src/common/constants/sort-pagination.dto';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { queryWithPagination } from 'src/common/helpers/paginate.helper';
import { ParseSingleSort } from 'src/common/helpers/parse-sort';
import { buildDataRange } from 'src/common/helpers/prisma.helper';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from 'src/common/interfaces/paginate-type';
import { BookingLite, OwnerLite } from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { INCLUDE_BOOKING_HISTORY } from './constants/include.constant.dto';
import { PaymentHistoryType } from './constants/payment-history.type';
import { PaymentCreationRequestDto } from './dto/requests/payment-creation-request.dto';
import { PaymentFilterRequestDto } from './dto/requests/payment-filter-request.dto';
import { PayOSPayloadDto } from './dto/requests/payos-payload.dto';
import { PaymentHistoryResponseDto } from './dto/responses/payment-history-response.dto';
import { PayOSCreatePaymentResponseDto } from './dto/responses/payos-creation-response.dto';
import { PayOSWebhookDTO } from './dto/responses/payos-webhook.dto';
import { PaymentCreationException } from './exceptions/payment-creation-exception';
@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: CustomLogger,
    private readonly bookingPublisher: BookingPublisher,
    private readonly prismaService: PrismaService,
    private readonly i18nService: I18nService,
  ) {}
  async create(dto: PaymentCreationRequestDto) {
    try {
      const payload = {
        orderCode: dto.bookingId,
        amount: dto.amount,
        description: dto.description ?? '',
        expiredAt: dto.expiredAt,
        returnUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/success',
      };
      const signature = this.signPayload(payload);
      const endpoint = `${this.configService.get<string>('payOS.endpoint', '')}/payment-requests`;
      const clientId = this.configService.get<string>('payOS.clientId', '');
      const apiKey = this.configService.get<string>('payOS.apiKey', '');
      const response: AxiosResponse<PayOSCreatePaymentResponseDto> =
        await axios.post(
          endpoint,
          {
            ...payload,
            signature,
          },
          {
            headers: {
              'x-client-id': clientId,
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          },
        );
      if (response.data.code !== '00') {
        throw new PaymentCreationException(response.data.desc);
      }
      return response.data;
    } catch (error) {
      const err = error as PaymentCreationException;
      throw new PaymentCreationException(err.message);
    }
  }
  handleWebhook(payload: PayOSWebhookDTO) {
    // Fallback để trả set url fallback webhook mỗi khi ngrok 1 url mới
    // if (payload.code == '00') {
    //   return { code: '00', desc: 'success' };
    // }
    console.log('PAYLOAD:: ', payload);
    const plaintData = instanceToPlain(payload.data) as Record<string, unknown>;
    const verified = this.isValidData(plaintData, payload.signature);
    if (!verified) throw new BadRequestException('Invalid Signature');
    if (payload.success && payload.code === '00') {
      const paymentPaidPayload: PaymentPaidPayloadDto = {
        bookingId: payload.data.orderCode,
        amount: payload.data.amount,
        method: PaymentMethod.BANK_TRANSFER,
      };
      this.bookingPublisher.publishBookingPaid(paymentPaidPayload);
      this.loggerService.debug(
        `Booking ${payload.data.orderCode} thanh toán thành công`,
      );
    } else {
      this.loggerService.debug(
        `Booking ${payload.data.orderCode} thanh toán thất bại`,
      );
    }
  }
  async history(
    query: PaymentFilterRequestDto,
  ): Promise<PaginationResult<PaymentHistoryResponseDto>> {
    const { sort, paginationParams } =
      this.getBuildSortAndPaginationParamPayments(query);
    const { startDate, endDate, status, method } = query;
    const dateFilter = buildDataRange(startDate, endDate);
    const queryOptions = {
      where: {
        ...(dateFilter ? { createdAt: dateFilter } : {}),
        ...(status ? { status: status } : {}),
        ...(method ? { method: method } : {}),
      },
      orderBy: sort,
      include: INCLUDE_BOOKING_HISTORY,
    };
    return this.getPaginatedPayments(paginationParams, queryOptions);
  }
  private signPayload(payload: PayOSPayloadDto): string {
    const rawData =
      `amount=${payload.amount}` +
      `&cancelUrl=${payload.cancelUrl}` +
      `&description=${payload.description}` +
      `&orderCode=${payload.orderCode}` +
      `&returnUrl=${payload.returnUrl}`;
    this.loggerService.debug(`RawData:: ${rawData}`);
    return crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('payOS.checkSumKey', ''),
      )
      .update(rawData)
      .digest('hex');
  }
  public isValidData(
    data: Record<string, unknown>,
    currentSignature: string,
  ): boolean {
    const sortedDataByKey = this.sortObjDataByKey(data);
    const dataQueryStr = this.convertObjToQueryStr(sortedDataByKey);
    const checkSumKey = this.configService.get<string>('payOS.checkSumKey', '');
    const generatedSignature = crypto
      .createHmac('sha256', checkSumKey)
      .update(dataQueryStr)
      .digest('hex');
    return generatedSignature === currentSignature;
  }
  private sortObjDataByKey<T extends Record<string, unknown>>(
    object: T,
  ): Record<string, unknown> {
    return Object.keys(object)
      .sort()
      .reduce<Record<string, unknown>>((obj, key) => {
        obj[key] = object[key];
        return obj;
      }, {});
  }
  private convertObjToQueryStr(object: Record<string, unknown>): string {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        if (Array.isArray(value)) {
          value = JSON.stringify(
            value.map((val) =>
              this.sortObjDataByKey(val as Record<string, unknown>),
            ),
          );
        }
        if (
          value === null ||
          value === undefined ||
          value === 'undefined' ||
          value === 'null'
        ) {
          value = '';
        }
        const stringValue = String(value);
        return `${key}=${stringValue}`;
      })
      .join('&');
  }
  private getBuildSortAndPaginationParamPayments(
    query: PaymentFilterRequestDto,
  ): SortAndPaginationParamDto {
    const { page, pageSize, sortBy, direction } = query;
    const fieldsValidEnum = Prisma.PaymentScalarFieldEnum;
    const sortFieldsValid = Object.values(fieldsValidEnum) as readonly string[];
    const fieldDefault = fieldsValidEnum.paidAt;
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
    return {
      sort,
      paginationParams,
    };
  }
  private async getPaginatedPayments(
    paginationParams: PaginationParams,
    options: FindOptions,
  ): Promise<PaginationResult<PaymentHistoryResponseDto>> {
    try {
      const payments = await queryWithPagination(
        this.prismaService.payment,
        paginationParams,
        options,
      );
      return {
        ...payments,
        data: payments.data.map((v: PaymentHistoryType) =>
          this.buildPaymentHistoryResponse(v),
        ),
      };
    } catch (exception) {
      logAndThrowPrismaClientError(
        exception as Error,
        PaymentService.name,
        'payment',
        'findPaymentHistory',
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
  private buildPaymentHistoryResponse(
    data: Payment & { booking: BookingLite & { user: OwnerLite } },
  ): PaymentHistoryResponseDto {
    return {
      id: data.id,
      amount: data.amount,
      method: data.method,
      status: data.status,
      paidAt: data.paidAt,
      booking: {
        id: data.booking.id,
        startTime: data.booking.startTime,
        endTime: data.booking.endTime,
      },
      user: {
        id: data.booking.user.id,
        name: data.booking.user.name,
      },
      createdAt: data.createdAt,
    };
  }
}
