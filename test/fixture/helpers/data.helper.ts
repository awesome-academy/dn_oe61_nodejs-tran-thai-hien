import { StatusKey } from 'src/common/enums/status-key.enum';
import { BaseResponse } from 'src/common/interfaces/base-response';

export const createBaseResponseExample = <T>(data: T): BaseResponse<T> => ({
  statusKey: StatusKey.SUCCESS,
  data,
});
