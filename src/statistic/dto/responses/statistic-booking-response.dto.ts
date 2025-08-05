export class StatisticBookingResponseDto {
  venueId?: number;
  startDate?: Date;
  endDate?: Date;
  total: number;
  byStatus: { status: string; total: number }[];
  byMonth: { month: string; total: number }[];
  byType: { type: string; total: number }[];
  bySpace: { name: string; type: string; total: number }[];
}
