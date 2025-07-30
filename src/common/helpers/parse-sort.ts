import { SortDirection } from '../enums/query.enum';

export function ParseSingleSort<TField extends string = string>(
  validFields: readonly TField[],
  defaultFiled: TField,
  sortDir: string,
  sortBy?: string,
): {
  [K in TField]: SortDirection;
} {
  const field =
    sortBy && validFields.includes(sortBy as TField)
      ? (sortBy as TField)
      : defaultFiled;
  const direction = ParseSortDirection(sortDir);
  return {
    [field]: direction,
  } as { [K in TField]: SortDirection };
}
export function ParseSortDirection(sortBy: string | undefined): string {
  const lower = sortBy?.toLocaleLowerCase();
  return lower === SortDirection.DESC ? SortDirection.DESC : SortDirection.ASC;
}
