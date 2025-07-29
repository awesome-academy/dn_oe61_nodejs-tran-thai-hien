import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { instanceToPlain } from 'class-transformer';
import * as crypto from 'crypto';
import { BookingPublisher } from 'src/booking/booking-publisher';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { PaymentCreationRequestDto } from './dto/requests/payment-creation-request.dto';
import { PayOSPayloadDto } from './dto/requests/payos-payload.dto';
import { PayOSCreatePaymentResponseDto } from './dto/responses/payos-creation-response.dto';
import { PayOSWebhookDTO } from './dto/responses/payos-webhook.dto';
import { PaymentPaidPayloadDto } from 'src/booking/dto/requests/payment-paid-payload';
import { PaymentMethod } from '@prisma/client';
import { PaymentCreationException } from './exceptions/payment-creation-exception';
@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: CustomLogger,
    private readonly bookingPublisher: BookingPublisher,
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
}
