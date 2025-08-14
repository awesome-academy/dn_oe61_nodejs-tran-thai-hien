import { BaseResponse } from 'src/common/interfaces/base-response';
import { SpaceManagerResponseDto } from 'src/space/dto/responses/space-manager-response.dto';
import { createBaseResponseExample } from 'test/fixture/helpers/data.helper';
export const AddManagerExample = {
  id: 1,
  name: 'Meeting Room A',
  type: 'PRIVATE_OFFICE',
  managers: [
    {
      id: 5,
      name: 'John Doe',
    },
    {
      id: 6,
      name: 'Jane Smith',
    },
  ],
};
export const AddManagerResponseExample: BaseResponse<SpaceManagerResponseDto> =
  createBaseResponseExample(AddManagerExample);
