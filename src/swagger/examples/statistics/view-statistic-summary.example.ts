import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatisticSummaryResponseDto } from 'src/statistic/dto/responses/statistic-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseViewStatisticSummary() {
  const path = '/statistics';
  return applyDecorators(
    ApiOperation({
      summary: 'Get statistic summary',
      description: 'Get statistic summary',
    }),
    SwaggerGetResponse(
      StatisticSummaryResponseDto,
      'Get statistic summary successfully',
      'Get statistic summary successfully',
    ),
    ApiErrorConflict(
      'Failed to get get statistic summary',
      'Failed to get get statistic summary',
      path,
    ),
    ApiErrorInternal(path),
  );
}
