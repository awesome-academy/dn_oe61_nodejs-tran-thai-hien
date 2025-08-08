export class StatisticUserResponseDto {
  startDate?: Date;
  endDate?: Date;
  total: number;
  usersWithBooking: number;
  usersWithoutBooking: number;
  byStatus: { status: string; total: number }[];
  byMonth: { month: string; total: number }[];
}
