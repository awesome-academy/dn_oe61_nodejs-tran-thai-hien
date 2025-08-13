import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SpaceSummaryResponseDto } from 'src/space/dto/responses/space-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetPublicSpace() {
  const path = '/spaces';
  return applyDecorators(
    ApiOperation({
      summary: 'Get all spaces',
      description: 'Get all public spaces',
    }),
    SwaggerGetPaginatedResponse(
      SpaceSummaryResponseDto,
      'Get all spaces',
      'Get all spaces successfully',
    ),
    ApiErrorConflict('Get all spaces failed', 'Failed to get all spaces', path),
    ApiErrorInternal(path),
  );
}
