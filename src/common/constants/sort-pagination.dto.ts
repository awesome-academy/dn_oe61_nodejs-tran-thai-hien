import { SortDirection } from '../enums/query.enum';
import { PaginationParams } from '../interfaces/paginate-type';

export class SortAndPaginationParamDto {
  sort: Record<string, SortDirection>;
  paginationParams: PaginationParams;
}
