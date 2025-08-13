import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequest,
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedArrayResponse,
} from 'src/swagger/decorators/swagger-response.decorator';
import { VenueSummaryResponseDto } from 'src/venue/dto/responses/venue-summary.response.dto';

export function ApiResponseUpdateStatusVenueBulk() {
  const path = '/admin/venues/status';
  return applyDecorators(
    ApiOperation({
      summary: 'Change venues status bulk',
    }),
    SwaggerUpdatedArrayResponse(
      VenueSummaryResponseDto,
      'Update venue status successfully',
      'Update venue status successfully',
    ),
    SwaggerNoContentResponse(),
    ApiErrorBadRequestValidation(
      'Error Validation',
      [
        {
          status:
            'The field status must be one of the allowed values status venue',
        },
      ],
      path,
    ),
    ApiErrorBadRequest('Missing venues', 'Missing venues: [1,3,6]'),
    ApiErrorConflict(
      'Update venue status failed',
      'Update venue status failed',
      path,
    ),
    ApiErrorInternal(path),
  );
}
