import { BaseResponse } from 'src/common/interfaces/base-response';
import { SpaceSummaryResponseDto } from 'src/space/dto/responses/space-summary-response.dto';
import { createBaseResponseExample } from 'test/fixture/helpers/data.helper';
import { SpaceSummaryResponse } from 'test/spaces/example/response/space-summary-example';
export const SpaceSummaryResponseExample: BaseResponse<SpaceSummaryResponseDto> =
  createBaseResponseExample(SpaceSummaryResponse);
