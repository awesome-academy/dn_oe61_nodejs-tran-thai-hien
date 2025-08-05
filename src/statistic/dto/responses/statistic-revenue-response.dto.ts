export class StatisticRevenueResponseDto {
  venueId?: number;
  startDate?: Date;
  endDate?: Date;
  total: number;
  byMonth: { month: string; total: number }[];
  byType: { type: string; total: number }[];
  bySpace: { name: string; type: string; total: number }[];
}
