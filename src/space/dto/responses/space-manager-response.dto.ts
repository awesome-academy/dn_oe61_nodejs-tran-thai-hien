import { OwnerLite } from 'src/common/interfaces/type';

export class SpaceManagerResponseDto {
  id: number;
  name: string;
  type: string;
  managers: OwnerLite[];
}
