import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { buildDataRange } from 'src/common/helpers/prisma.helper';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { formatDateToSql } from 'src/common/utils/date.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatisticBookingFilterDto } from './dto/requests/statistic-booking-filter.dto';
import { StatisticBookingResponseDto } from './dto/responses/statistic-booking-response.dto';
import { StatisticRevenueFilterDto } from './dto/requests/statistic-revenue-filter.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { BaseResponse } from 'src/common/interfaces/base-response';
import { StatisticRevenueResponseDto } from './dto/responses/statistic-revenue-response.dto';
import { buildBaseResponse } from 'src/common/utils/data.util';
import { StatisticUserFilterDto } from './dto/requests/statistic-user-filter.dto';
import { StatisticUserResponseDto } from './dto/responses/statistic-user-response.dto';
import { TopBookingUserFilterDto } from './dto/requests/top-booking-user-filter.dto';
import { TopVenueFilterDto } from './dto/requests/top-venue-filter.dto';
import { TopBookingUserResponseDto } from './dto/responses/top-booking-user-response.dto';
import { TopVenueResponseDto } from './dto/responses/top-venue.dto';

@Injectable()
export class StatisticService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerServive: CustomLogger,
    private readonly i18nService: I18nService,
  ) {}
  async statisticBookings(
    query: StatisticBookingFilterDto,
  ): Promise<StatisticBookingResponseDto> {
    const { startDate, endDate, venueId } = query;
    const dateFilter = buildDataRange(startDate, endDate);
    const queryBookingsFilter = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(venueId
        ? {
            space: {
              venueId: venueId,
            },
          }
        : {}),
    };
    try {
      const totalBookings = await this.prismaService.booking.count({
        where: queryBookingsFilter,
      });
      const totalBookingsByStatus = await this.prismaService.booking.groupBy({
        by: ['status'],
        where: queryBookingsFilter,
        _count: { _all: true },
      });
      const byStatus = totalBookingsByStatus.map((b) => ({
        status: b.status,
        total: b._count._all,
      }));
      const totalBookingsBySpaceType =
        await this.prismaService.booking.findMany({
          where: queryBookingsFilter,
          include: {
            space: {
              select: {
                type: true,
              },
            },
          },
        });
      const typeMap = new Map<string, number>();
      totalBookingsBySpaceType.forEach((b) => {
        const type = b.space.type;
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
      const byType = Array.from(typeMap.entries()).map(([type, total]) => ({
        type,
        total,
      }));
      const byMonth = await this.getStatisticBookingByMonth(
        startDate,
        endDate,
        venueId,
      );
      const bySpaces = await this.getStatisticBookingBySpace(
        startDate,
        endDate,
        venueId,
      );
      const dataResponse: StatisticBookingResponseDto = {
        venueId: venueId,
        startDate: startDate,
        endDate: endDate,
        total: Number(totalBookings),
        byStatus: byStatus,
        byType: byType,
        byMonth: byMonth,
        bySpace: bySpaces,
      };
      return dataResponse;
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        StatisticService.name,
        'statistic',
        'findstatisticBookings',
        StatusKey.FAILED,
        this.loggerServive,
        this.i18nService,
      );
    }
  }
  async statisticRevenues(
    query: StatisticRevenueFilterDto,
  ): Promise<BaseResponse<StatisticRevenueResponseDto>> {
    const { startDate, endDate, venueId } = query;
    const dateFilter = buildDataRange(startDate, endDate);
    const queryPaymentsFilter = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(venueId
        ? {
            booking: {
              space: {
                venueId: venueId,
              },
            },
          }
        : {}),
      status: PaymentStatus.PAID,
    };
    try {
      const revenues = await this.prismaService.payment.findMany({
        where: queryPaymentsFilter,
      });
      const totalRevenues = revenues.reduce(
        (cur, nextVal) => cur + nextVal.amount,
        0,
      );
      const totalRevenueByType = await this.prismaService.payment.findMany({
        where: queryPaymentsFilter,
        include: {
          booking: {
            include: {
              space: {
                select: {
                  type: true,
                },
              },
            },
          },
        },
      });
      const typeMap = new Map<string, number>();
      totalRevenueByType.forEach((p) => {
        const type = p.booking.space.type;
        typeMap.set(type, (typeMap.get(type) || 0) + p.amount);
      });
      const byType = Array.from(typeMap.entries()).map(([type, total]) => ({
        type,
        total,
      }));
      const byMonth = await this.getStatisticRevenueByMonth(
        startDate,
        endDate,
        venueId,
      );
      const bySpace = await this.getStatisticRevenueBySpace(
        startDate,
        endDate,
        venueId,
      );
      const dataResponse: StatisticRevenueResponseDto = {
        venueId,
        startDate,
        endDate,
        total: totalRevenues,
        byType: byType,
        byMonth: byMonth,
        bySpace: bySpace,
      };
      return buildBaseResponse(StatusKey.SUCCESS, dataResponse);
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        StatisticService.name,
        'statistic',
        'findStatisticRevenues',
        StatusKey.FAILED,
        this.loggerServive,
        this.i18nService,
      );
    }
  }
  async statisticUsers(
    query: StatisticUserFilterDto,
  ): Promise<BaseResponse<StatisticUserResponseDto>> {
    const { startDate, endDate } = query;
    const dateFilter = buildDataRange(startDate, endDate);
    const userFilter = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    try {
      const totalUsers = await this.prismaService.user.count({
        where: userFilter,
      });
      const userWithBookings = await this.prismaService.booking.groupBy({
        by: ['userId'],
      });
      const usersStatus = await this.prismaService.user.groupBy({
        by: ['status'],
        _count: { _all: true },
      });
      const byStatus = usersStatus.map((u) => ({
        status: u.status,
        total: Number(u._count._all),
      }));
      const userWithBookingsCount = userWithBookings.length;
      const userWithoutBookings = totalUsers - userWithBookingsCount;
      const byMonth = await this.getStatisticUserByMonth(startDate, endDate);
      const dataResponse: StatisticUserResponseDto = {
        startDate,
        endDate,
        total: totalUsers,
        usersWithBooking: userWithBookingsCount,
        usersWithoutBooking: userWithoutBookings,
        byStatus,
        byMonth,
      };
      return buildBaseResponse(StatusKey.SUCCESS, dataResponse);
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        StatisticService.name,
        'statistic',
        'findStatisticUsers',
        StatusKey.FAILED,
        this.loggerServive,
        this.i18nService,
      );
    }
  }
  async findTopBookingUsers(
    filter: TopBookingUserFilterDto,
  ): Promise<BaseResponse<TopBookingUserResponseDto[]>> {
    const { startDate, endDate, limit } = filter;
    const status = BookingStatus.COMPLETED;
    let conditions: string[] = [];
    conditions = this.buildDateConditions('bookings', startDate, endDate);
    conditions.push(`bookings.status = '${status}'`);
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT users.id AS id, users.name, COUNT(*) AS totalBookings
            FROM bookings
            JOIN users ON bookings.userId = users.id
            ${whereClause}
            GROUP BY users.id
            ORDER BY totalBookings DESC
            LIMIT ${limit};`;
    try {
      const topUsers = await this.runQuery<TopBookingUserResponseDto>(query);
      const result: TopBookingUserResponseDto[] = topUsers.map((u) => ({
        id: u.id,
        name: u.name,
        totalBookings: Number(u.totalBookings),
      }));
      return buildBaseResponse(StatusKey.SUCCESS, result);
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        StatisticService.name,
        'statistic',
        'findTopBookingUsers',
        StatusKey.FAILED,
        this.loggerServive,
        this.i18nService,
      );
    }
  }
  async findTopVenue(
    filter: TopVenueFilterDto,
  ): Promise<BaseResponse<TopVenueResponseDto[]>> {
    const { startDate, endDate, limit } = filter;
    const status = BookingStatus.COMPLETED;
    let conditions: string[] = [];
    conditions = this.buildDateConditions('bookings', startDate, endDate);
    conditions.push(`bookings.status = '${status}'`);
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT venues.id AS id, venues.name, COUNT(*) AS totalBookings
            FROM bookings
            JOIN spaces ON bookings.spaceId = spaces.id
            JOIN venues ON spaces.venueId = venues.id
            ${whereClause}
            GROUP BY venues.id
            ORDER BY totalBookings DESC
            LIMIT ${limit}`;
    try {
      const topUsers = await this.runQuery<TopVenueResponseDto>(query);
      const result: TopVenueResponseDto[] = topUsers.map((u) => ({
        id: u.id,
        name: u.name,
        totalBookings: Number(u.totalBookings),
      }));
      return buildBaseResponse(StatusKey.SUCCESS, result);
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        StatisticService.name,
        'statistic',
        'findTopBookingUsers',
        StatusKey.FAILED,
        this.loggerServive,
        this.i18nService,
      );
    }
  }
  private async getStatisticBookingByMonth(
    startDate?: Date,
    endDate?: Date,
    venueId?: number,
  ): Promise<{ month: string; total: number }[]> {
    let conditions: string[] = [];
    conditions = this.buildDateConditions('bookings', startDate, endDate);
    if (venueId) conditions.push(`spaces.venueId = '${venueId}'`);
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT DATE_FORMAT(bookings.createdAt, '%Y-%m') AS month, COUNT(*) AS total
                    FROM bookings
                    JOIN spaces ON bookings.spaceId = spaces.id
                    ${whereClause}
                    GROUP BY month
                    ORDER BY month;`;
    const result = await this.runQuery<{ month: string; total: number }>(query);
    return result.map((m) => ({
      month: m.month,
      total: Number(m.total),
    }));
  }
  private async getStatisticBookingBySpace(
    startDate?: Date,
    endDate?: Date,
    venueId?: number,
  ): Promise<{ name: string; type: string; total: number }[]> {
    let conditions: string[] = [];
    conditions = this.buildDateConditions('bookings', startDate, endDate);
    if (venueId) {
      conditions.push(`spaces.venueId = ${venueId}`);
    }
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT spaces.name,spaces.type, COUNT(*) AS total FROM bookings JOIN spaces ON
     bookings.spaceId = spaces.id ${whereClause} GROUP BY spaces.id ORDER BY total DESC;`;
    const goupedBySpace = await this.runQuery<{
      name: string;
      type: string;
      total: number;
    }>(query);
    return goupedBySpace.map((space) => ({
      name: space.name,
      type: space.type,
      total: Number(space.total),
    }));
  }
  private async getStatisticRevenueByMonth(
    startDate?: Date,
    endDate?: Date,
    venueId?: number,
  ): Promise<{ month: string; total: number }[]> {
    let conditions: string[] = [];
    conditions = this.buildDateConditions('payments', startDate, endDate);
    if (venueId) {
      conditions.push(`spaces.venueId = ${venueId}`);
    }
    if (venueId) conditions.push(`spaces.venueId = '${venueId}'`);
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT DATE_FORMAT(payments.createdAt, '%Y-%m') AS month, SUM(payments.amount) AS total
                    FROM payments
                    JOIN bookings ON bookings.id = payments.bookingId
                    JOIN spaces ON bookings.spaceId = spaces.id
                    ${whereClause}
                    GROUP BY month
                    ORDER BY month;`;
    const groupedByMonth = await this.runQuery<{
      month: string;
      total: number;
    }>(query);
    return groupedByMonth.map((m) => ({
      month: m.month,
      total: Number(m.total),
    }));
  }
  private async getStatisticRevenueBySpace(
    startDate?: Date,
    endDate?: Date,
    venueId?: number,
  ): Promise<{ name: string; type: string; total: number }[]> {
    let conditions: string[] = [];
    conditions = this.buildDateConditions('payments', startDate, endDate);
    if (venueId) {
      conditions.push(`spaces.venueId = ${venueId}`);
    }
    if (venueId) conditions.push(`spaces.venueId = '${venueId}'`);
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT
            spaces.name,
            spaces.type,
            SUM(payments.amount) AS total
        FROM payments
        JOIN bookings ON bookings.id = payments.bookingId
        JOIN spaces ON bookings.spaceId = spaces.id
        ${whereClause}
        GROUP BY spaces.id
        ORDER BY total DESC;`;
    const groupedBySpace = await this.runQuery<{
      name: string;
      type: string;
      total: number;
    }>(query);
    return groupedBySpace.map((space) => ({
      name: space.name,
      type: space.type,
      total: Number(space.total),
    }));
  }
  private async getStatisticUserByMonth(startDate?: Date, endDate?: Date) {
    let conditions: string[] = [];
    conditions = this.buildDateConditions('users', startDate, endDate);
    const whereClause = this.buildWhereClause(conditions);
    const query = `SELECT DATE_FORMAT(createdAt,'%Y-%m') as month,count(*) as total 
        From users
        ${whereClause}
        GROUP BY month
        ORDER BY month;`;
    const groupedByUser = await this.runQuery<{
      month: string;
      total: number;
    }>(query);
    return groupedByUser.map((user) => ({
      month: user.month,
      total: Number(user.total),
    }));
  }
  private buildWhereClause(filters: string[]): string {
    return filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  }
  private buildDateConditions(
    table: string,
    startDate?: Date,
    endDate?: Date,
  ): string[] {
    const conditions: string[] = [];
    if (startDate)
      conditions.push(`${table}.createdAt >= '${formatDateToSql(startDate)}'`);
    if (endDate)
      conditions.push(`${table}.createdAt <= '${formatDateToSql(endDate)}'`);
    return conditions;
  }
  private async runQuery<T>(query: string): Promise<T[]> {
    return await this.prismaService.$queryRawUnsafe<T[]>(query);
  }
}
