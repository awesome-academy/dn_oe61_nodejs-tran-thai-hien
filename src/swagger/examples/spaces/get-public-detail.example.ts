import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SpaceSummaryResponseDto } from 'src/space/dto/responses/space-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetPublicDetail() {
  const path = '/spaces/id';
  return applyDecorators(
    ApiOperation({
      summary: 'Get detail spaces',
      description: 'Get detail public spaces',
    }),
    SwaggerGetResponse(
      SpaceSummaryResponseDto,
      'Get detail space successfully',
      'Get detail space successfully',
    ),
    ApiErrorConflict(
      'Failed to get detail space',
      'Failed to get detail space',
      path,
    ),
    ApiErrorInternal(path),
  );
}
