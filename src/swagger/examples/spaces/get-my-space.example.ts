import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SpaceSummaryResponseDto } from 'src/space/dto/responses/space-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetMySpace() {
  const path = '/spaces/me';
  return applyDecorators(
    ApiOperation({
      summary: 'Get all spaces manager sucessfully',
      description: 'Get all spaces manager sucessfully',
    }),
    SwaggerGetPaginatedResponse(
      SpaceSummaryResponseDto,
      'Get all spaces manager sucessfully',
      'Get all spaces manager sucessfully',
    ),
    ApiErrorConflict(
      'Get all spaces manager failed',
      'Failed to get all spaces manager',
      path,
    ),
    ApiErrorInternal(path),
  );
}
