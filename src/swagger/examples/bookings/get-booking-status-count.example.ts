import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BookingStatusCountDto } from 'src/booking/dto/responses/bookig-status-count.response';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetBookingStatusCount() {
  const path = '/bookings/status';
  return applyDecorators(
    ApiOperation({
      summary: 'Get count status booking',
    }),
    SwaggerGetResponse(
      BookingStatusCountDto,
      'Get count status booking successfully',
      'Get count status booking successfully',
    ),
    ApiErrorConflict(
      'Get count status booking failed',
      'Get count status booking failed',
    ),
    ApiErrorInternal(path),
  );
}
