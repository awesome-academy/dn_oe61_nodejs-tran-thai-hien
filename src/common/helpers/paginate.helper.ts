import { PaginationDataDto } from '../constants/pagination-data.dto';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from '../interfaces/paginate-type';

export async function queryWithPagination<
  TEntity,
  TmodelDelegate extends {
    findMany(args: any): Promise<TEntity[]>;
    count(args: any): Promise<number>;
  },
>(
  model: TmodelDelegate,
  options: PaginationParams,
  findOptions?: FindOptions,
): Promise<PaginationResult<TEntity>> {
  const { page, pageSize } = options;
  const totalItems = await model.count({ where: findOptions?.where });
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const safePages = Math.min(Math.max(page, 1), totalPages);
  const skip = (safePages - 1) * pageSize;
  const items = await model.findMany({
    skip,
    take: pageSize,
    ...findOptions,
  });
  return {
    data: items,
    meta: {
      totalItems,
      itemCount: items.length,
      currentPage: safePages,
      itemsPerPage: pageSize,
      totalPages,
    },
  };
}
export function getPaginationData(
  totalCount: number,
  page: number,
  pageSize: number,
): PaginationDataDto {
  const safePageSize = Math.max(Number(pageSize) || 10, 1);
  const totalItems = Number(totalCount || 0);
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const skip = Math.max((safePage - 1) * safePageSize, 0);
  return {
    totalItems,
    totalPages,
    safePage,
    safePageSize,
    skip,
  };
}
