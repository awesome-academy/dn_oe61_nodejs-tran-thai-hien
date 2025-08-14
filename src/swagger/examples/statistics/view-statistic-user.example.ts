import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatisticUserResponseDto } from 'src/statistic/dto/responses/statistic-user-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseViewStatisticUser() {
  const path = '/statistics/users';
  return applyDecorators(
    ApiOperation({
      summary: 'Get statistics users',
      description: 'Get statistics users',
    }),
    SwaggerGetResponse(
      StatisticUserResponseDto,
      'Get statistics users successfully',
      'Get statistics users successfully',
    ),
    ApiErrorConflict(
      'Failed to get statistics users',
      'Failed to get statistics users',
      path,
    ),
    ApiErrorInternal(path),
  );
}
