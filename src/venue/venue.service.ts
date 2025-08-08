import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AmenityStatus, Prisma, Venue, VenueStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { validateAmenities } from 'src/common/helpers/amenity.helper';
import {
  getErrorPrismaClient,
  logAndThrowPrismaClientError,
} from 'src/common/helpers/catch-error.helper';
import {
  getPaginationData,
  queryWithPagination,
} from 'src/common/helpers/paginate.helper';
import { ParseSingleSort } from 'src/common/helpers/parse-sort';
import { getUserOrFail } from 'src/common/helpers/user.helper';
import { BaseResponse } from 'src/common/interfaces/base-response';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from 'src/common/interfaces/paginate-type';
import {
  AmenityLite,
  OwnerLite,
  ProfileLite,
  SpaceDetail,
  SpaceLite,
} from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { buildBaseResponse, buildDataUpdate } from 'src/common/utils/data.util';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  VENUE_DETAIL,
  VENUE_INCLUDE_SUMMARY,
} from './constant/include.constant';
import { StatusVenueUpdateRequestDto } from './dto/requests/status-venue-update.request.dto';
import { VenueCreationRequestDto } from './dto/requests/venue-creation.request.dto';
import { VenueUpdateRequestDto } from './dto/requests/venue-update.request.dto';
import { VenueCreationResponseDto } from './dto/responses/venue-creation.response.dto';
import { VenueDetailResponseDto } from './dto/responses/venue-detail.response.dto';
import { VenueSummaryResponseDto } from './dto/responses/venue-summary.response.dto';
import { ActionStatus } from './enums/action-status.enum';
import { VenueSummaryType } from './interfaces/venue-summary.type';
import { VenueMapResponseDto } from './dto/responses/venue-map.response.dto';
import { VenueMapFilterDto } from './dto/requests/venue-filter-map.request.dto';
import { SortAndPaginationParamDto } from 'src/common/constants/sort-pagination.dto';
import { NotificationPublisher } from 'src/notification/notification-publisher';
import { CreateVenuePayload } from 'src/notification/dto/payloads/create-venue-payload';
import { VenueStatusNotiPayload } from 'src/notification/dto/payloads/status-venue-payload';
@Injectable()
export class VenueService {
  constructor(
    private readonly i18nService: I18nService,
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly notificationPublisher: NotificationPublisher,
  ) {}
  async create(
    currentUser: AccessTokenPayload,
    dto: VenueCreationRequestDto,
  ): Promise<BaseResponse<VenueCreationResponseDto>> {
    const owner = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    await this.validateVenueName(dto.name);
    if (dto?.amenities) {
      await validateAmenities(
        dto.amenities,
        this.prismaService,
        this.i18nService,
      );
    }
    const venueData: Prisma.VenueCreateInput = {
      name: dto.name,
      city: dto.city,
      street: dto.street,
      latitude: dto.latitude,
      longitude: dto.longitude,
      owner: {
        connect: {
          id: owner.id,
        },
      },
      venueAmenities: {
        create: (dto.amenities ?? []).map((id) => ({
          amenity: { connect: { id } },
        })),
      },
    };
    try {
      const venueCreated = await this.prismaService.$transaction((tx) =>
        tx.venue.create({
          data: venueData,
          include: {
            venueAmenities: {
              select: {
                amenity: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      );
      const createVenueNotiPayload: CreateVenuePayload = {
        id: venueCreated.id,
        venueName: venueCreated.name,
        ownerName: venueCreated.owner.name,
        createdAt: venueCreated.createdAt,
      };
      this.notificationPublisher.publishVenueCreated(createVenueNotiPayload);
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildVenueCreationResponse(venueCreated),
      );
    } catch (error) {
      const errorPrismaClient = error as PrismaClientKnownRequestError;
      const message = getErrorPrismaClient(errorPrismaClient, 'Create venue');
      this.loggerService.error(
        message,
        JSON.stringify(error),
        VenueService.name,
      );
      throw new ConflictException(
        this.i18nService.translate('common.venue.action.create.failed'),
      );
    }
  }
  async findPublicVenues(
    query: QueryParamDto,
  ): Promise<PaginationResult<VenueSummaryResponseDto>> {
    const { search } = query;
    const { sort, paginationParams } =
      this.getBuildSortAndPaginationParamVenues(query);
    const queryOptions = {
      where: {
        ...(search ? { name: { contains: search } } : {}),
        status: VenueStatus.APPROVED,
        deletedAt: null,
      },
      include: VENUE_INCLUDE_SUMMARY,
      orderBy: sort,
    };
    return this.getPaginatedVenues(paginationParams, queryOptions);
  }
  async findVenuesByOwner(
    currentUser: AccessTokenPayload,
    query: QueryParamDto,
  ): Promise<PaginationResult<VenueSummaryResponseDto>> {
    const owner = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const { search, page, pageSize } = query;
    const paginationParams: PaginationParams = {
      page,
      pageSize,
    };
    const queryOptions = {
      where: {
        ...(search ? { name: { contains: search } } : {}),
        ownerId: owner.id,
      },
      include: VENUE_INCLUDE_SUMMARY,
    };
    return this.getPaginatedVenues(paginationParams, queryOptions);
  }
  async update(
    currentUser: AccessTokenPayload,
    venueId: number,
    dto: VenueUpdateRequestDto,
  ): Promise<BaseResponse<VenueSummaryResponseDto>> {
    this.validateUpdateDto(dto);
    const owner = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const venue = await this.ensureVenueOwner(venueId, owner.id);
    const venueData: Prisma.VenueUpdateInput = buildDataUpdate(dto, venue);
    if (Object.values(venueData).length === 0)
      return buildBaseResponse(StatusKey.UNCHANGED);
    if (dto?.amenities) {
      await validateAmenities(
        dto.amenities,
        this.prismaService,
        this.i18nService,
      );
    }
    if (dto?.name) {
      await this.validateVenueName(dto.name);
    }
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const currentAmenities = await tx.venueAmenity.findMany({
          where: {
            venueId: venue.id,
            status: AmenityStatus.ACTIVE,
          },
        });
        const currentAmenityIds = currentAmenities.map((a) => a.amenityId);
        const newAmenities = dto.amenities ?? [];
        const removedAmenityIds = currentAmenityIds.filter(
          (id) => !newAmenities.includes(id),
        );
        const addedAmenityIds = newAmenities.filter(
          (id) => !currentAmenityIds.includes(id),
        );
        if (removedAmenityIds.length > 0) {
          await tx.venueAmenity.updateMany({
            where: {
              venueId: venue.id,
              amenityId: { in: removedAmenityIds },
              status: AmenityStatus.ACTIVE,
            },
            data: {
              status: AmenityStatus.TEMPORARY_UNAVAILABLE,
              endDate: new Date(),
            },
          });
        }
        if (addedAmenityIds.length > 0) {
          await tx.venueAmenity.createMany({
            data: addedAmenityIds.map((id) => ({
              venueId: venue.id,
              amenityId: id,
            })),
          });
        }
        const updatedVenue = await tx.venue.update({
          where: {
            id: venue.id,
          },
          data: venueData,
          include: VENUE_INCLUDE_SUMMARY,
        });
        return buildBaseResponse(
          StatusKey.SUCCESS,
          this.buildVenueSummaryResponse(updatedVenue),
        );
      });
    } catch (error) {
      const errorPrismaClient = error as PrismaClientKnownRequestError;
      const message = getErrorPrismaClient(errorPrismaClient, 'Update Venue');
      this.loggerService.error(
        message,
        JSON.stringify(error),
        VenueService.name,
      );
      throw new ConflictException(
        this.i18nService.translate('common.profile.action.updateFailed'),
      );
    }
  }
  async delete(
    currentUser: AccessTokenPayload,
    venueId: number,
  ): Promise<BaseResponse<null>> {
    const owner = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    const venue = await this.ensureVenueOwner(venueId, owner.id);
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.venue.update({
          where: { id: venue.id },
          data: { deletedAt: new Date() },
        });
        await tx.space.updateMany({
          where: { venueId: venue.id },
          data: { deletedAt: new Date() },
        });
        await tx.venueAmenity.updateMany({
          where: { venueId: venue.id, status: AmenityStatus.ACTIVE },
          data: {
            status: AmenityStatus.TEMPORARY_UNAVAILABLE,
            endDate: new Date(),
          },
        });
      });
    } catch (error) {
      const errorPrismaClient = error as PrismaClientKnownRequestError;
      const message = getErrorPrismaClient(errorPrismaClient, 'Create venue');
      this.loggerService.error(
        message,
        JSON.stringify(error),
        VenueService.name,
      );
      throw new ConflictException(
        this.i18nService.translate('common.venue.action.create.failed'),
      );
    }
    return buildBaseResponse(StatusKey.SUCCESS);
  }
  async changeStatusVenue(
    user: AccessTokenPayload,
    venueId: number,
    dto: StatusVenueUpdateRequestDto,
    action: ActionStatus,
  ): Promise<BaseResponse<VenueSummaryResponseDto | null>> {
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      user.sub,
    );
    const venue = await this.prismaService.venue.findUnique({
      where: {
        id: venueId,
      },
    });
    if (!venue)
      throw new NotFoundException(
        this.i18nService.translate('common.venue.notFound'),
      );
    const { status } = dto;
    if (venue.status === status)
      return buildBaseResponse(StatusKey.UNCHANGED, null);
    const statusUpdate = status as VenueStatus;
    try {
      const venueUpdated = await this.prismaService.venue.update({
        where: {
          id: venueId,
        },
        data: {
          status: statusUpdate,
        },
        include: VENUE_INCLUDE_SUMMARY,
      });
      this.publisherChangeStatusVenue(
        statusUpdate,
        venueUpdated,
        userDetail.name,
        '',
      );
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildVenueSummaryResponse(venueUpdated),
      );
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        VenueService.name,
        'venue',
        action,
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async findVenues(
    query: QueryParamDto,
  ): Promise<PaginationResult<VenueSummaryResponseDto>> {
    const { search } = query;
    const { sort, paginationParams } =
      this.getBuildSortAndPaginationParamVenues(query);
    const queryOptions = {
      where: {
        ...(search ? { name: { contains: search } } : {}),
      },
      include: VENUE_INCLUDE_SUMMARY,
      orderBy: sort,
    };
    return this.getPaginatedVenues(paginationParams, queryOptions);
  }
  async findDetailPublicVenue(
    currentUser: AccessTokenPayload,
    venueId: number,
  ): Promise<BaseResponse<VenueDetailResponseDto>> {
    const venue = await this.prismaService.venue.findUnique({
      where: { id: venueId },
      include: VENUE_DETAIL,
    });
    if (!venue) {
      throw new NotFoundException(
        this.i18nService.translate('common.venue.notFound'),
      );
    }
    const user = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    if (venue.status !== VenueStatus.APPROVED && venue.ownerId !== user.id)
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    return buildBaseResponse(
      StatusKey.SUCCESS,
      this.buildVenueDetailResponse(venue),
    );
  }
  async findDetailVenue(
    venueId: number,
  ): Promise<BaseResponse<VenueDetailResponseDto>> {
    try {
      const venue = await this.prismaService.venue.findUnique({
        where: { id: venueId },
        include: VENUE_DETAIL,
      });
      if (!venue) {
        throw new NotFoundException(
          this.i18nService.translate('common.venue.notFound'),
        );
      }
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildVenueDetailResponse(venue),
      );
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        VenueService.name,
        'venue',
        'findDetailVenue',
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async findVenuesForMap(
    query: QueryParamDto,
  ): Promise<PaginationResult<VenueMapResponseDto>> {
    const { search } = query;
    const { sort, paginationParams } =
      this.getBuildSortAndPaginationParamVenues(query);
    const queryOptions = {
      where: {
        ...(search ? { name: { contains: search } } : {}),
        status: VenueStatus.APPROVED,
        deletedAt: null,
      },
      orderBy: sort,
    };
    return this.getPaginatedVenuesMap(paginationParams, queryOptions);
  }
  async findNearByVenues(
    query: VenueMapFilterDto,
  ): Promise<PaginationResult<Venue>> {
    const { latitude, longitude, maxDistance, page, pageSize } = query;
    const distanceFormula = `
    (6371 * acos(
      cos(radians(${latitude})) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(${longitude})) +
      sin(radians(${latitude})) * sin(radians(latitude))
    ))
  `;
    const totalCountResult = await this.prismaService.$queryRawUnsafe<
      { count: number }[]
    >(`
    SELECT CAST(COUNT(*) AS SIGNED) as count
    FROM (
      SELECT ${distanceFormula} AS distance
      FROM venues
      WHERE status = 'APPROVED'
      AND deletedAt is null
      ${maxDistance !== undefined ? `AND ${distanceFormula} <= ${maxDistance}` : ''}
    ) AS sub
  `);
    const itemsCount = Number(totalCountResult[0]?.count || 0);
    const paginationData = getPaginationData(itemsCount, page, pageSize);
    const { totalItems, totalPages, safePage, safePageSize, skip } =
      paginationData;
    const venues = await this.prismaService.$queryRawUnsafe<Venue[]>(`
    SELECT *,
      ${distanceFormula} AS distance
    FROM venues
    WHERE status = 'APPROVED'
    AND deletedAt is null
    ${maxDistance !== undefined ? `AND ${distanceFormula} <= ${maxDistance}` : ''}
    ORDER BY distance ASC
    LIMIT ${safePageSize} OFFSET ${skip}
  `);
    return {
      data: venues,
      meta: {
        itemCount: venues.length,
        currentPage: safePage,
        itemsPerPage: safePageSize,
        totalItems,
        totalPages,
      },
    };
  }
  private buildVenueCreationResponse(
    data: Venue & {
      venueAmenities: { amenity: { name: string } }[];
      owner: OwnerLite;
    },
  ): VenueCreationResponseDto {
    return {
      id: data.id,
      name: data.name,
      city: data.city,
      street: data.street,
      latitude: data.latitude,
      longitude: data.longitude,
      ownerId: data.owner.id,
      ownerName: data.owner.name,
      amenitiesName: data.venueAmenities.map(
        (venueAmenity) => venueAmenity.amenity.name,
      ),
    };
  }
  private buildVenueSummaryResponse(
    data: Venue & {
      venueAmenities: { status: AmenityStatus; amenity: AmenityLite }[];
      owner: OwnerLite;
      spaces: SpaceLite[];
    },
  ): VenueSummaryResponseDto {
    return {
      id: data.id,
      name: data.name,
      city: data.city,
      street: data.street,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      ownerId: data.owner.id,
      ownerName: data.owner.name,
      amenities: data.venueAmenities.map((venueAmenity) => ({
        id: venueAmenity.amenity.id,
        name: venueAmenity.amenity.name,
        status: venueAmenity.status,
      })),
      spaces: data.spaces,
    };
  }
  private buildVenueMapResponse(data: Venue): VenueMapResponseDto {
    return {
      id: data.id,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      street: data.street,
      city: data.city,
    };
  }
  private buildVenueDetailResponse(
    data: Venue & {
      venueAmenities: { status: AmenityStatus; amenity: AmenityLite }[];
      owner: { id: number; name: string; profile: ProfileLite | null };
      spaces: SpaceDetail[];
    },
  ): VenueDetailResponseDto {
    return {
      id: data.id,
      name: data.name,
      city: data.city,
      street: data.street,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      createdDate: data.createdAt,
      owner: {
        id: data.owner.id,
        name: data.owner.name,
        address: data.owner.profile?.address ?? null,
        phone: data.owner.profile?.phone ?? null,
      },
      amenities: data.venueAmenities.map((venueAmenity) => ({
        id: venueAmenity.amenity.id,
        name: venueAmenity.amenity.name,
        status: venueAmenity.status,
      })),
      spaces: data.spaces,
    };
  }
  private async getPaginatedVenues(
    paginationParams: PaginationParams,
    options: FindOptions,
  ): Promise<PaginationResult<VenueSummaryResponseDto>> {
    try {
      const venues = await queryWithPagination(
        this.prismaService.venue,
        paginationParams,
        options,
      );
      return {
        ...venues,
        data: venues.data.map((v: VenueSummaryType) =>
          this.buildVenueSummaryResponse(v),
        ),
      };
    } catch (exception) {
      logAndThrowPrismaClientError(
        exception as Error,
        VenueService.name,
        'venue',
        'findVenues',
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
  private async getPaginatedVenuesMap(
    paginationParams: PaginationParams,
    options: FindOptions,
  ): Promise<PaginationResult<VenueMapResponseDto>> {
    try {
      const venues = await queryWithPagination(
        this.prismaService.venue,
        paginationParams,
        options,
      );
      return {
        ...venues,
        data: venues.data.map((v: Venue) => this.buildVenueMapResponse(v)),
      };
    } catch (exception) {
      logAndThrowPrismaClientError(
        exception as Error,
        VenueService.name,
        'venue',
        'findVenuesMap',
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
  private async ensureVenueOwner(venueId: number, userId: number) {
    const venue = await this.prismaService.venue.findUnique({
      where: {
        id: venueId,
      },
      include: {
        venueAmenities: true,
      },
    });
    if (!venue)
      throw new BadRequestException(
        this.i18nService.translate('common.venue.notFound'),
      );
    if (venue?.ownerId !== userId)
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    return venue;
  }
  private async validateVenueName(name: string) {
    const venueExistByName = await this.prismaService.venue.findUnique({
      where: { name },
    });
    if (venueExistByName) {
      throw new BadRequestException(
        this.i18nService.translate('common.venue.nameExists'),
      );
    }
  }
  private validateUpdateDto(dto: VenueUpdateRequestDto) {
    if (Object.values(dto).every((v) => v === undefined)) {
      throw new BadRequestException(
        this.i18nService.translate('common.validation.atLeastOneDefined'),
      );
    }
  }
  private publisherChangeStatusVenue(
    statusUpdate: VenueStatus,
    data: Venue,
    actionBy: string,
    reason?: string,
  ) {
    const payload: VenueStatusNotiPayload = {
      actionBy,
      ownerId: data.ownerId,
      updatedAt: data.updatedAt,
      venueId: data.id,
      venueName: data.name,
      reason,
    };
    console.log('Dô:: ', JSON.stringify(payload));
    switch (statusUpdate) {
      case VenueStatus.APPROVED:
        this.notificationPublisher.publishStatusVenue(
          payload,
          VenueStatus.APPROVED,
        );
        break;
      case VenueStatus.REJECTED:
        this.notificationPublisher.publishStatusVenue(
          payload,
          VenueStatus.REJECTED,
        );
        break;
      case VenueStatus.BLOCKED:
        this.notificationPublisher.publishStatusVenue(
          payload,
          VenueStatus.BLOCKED,
        );
        break;
    }
  }
  private getBuildSortAndPaginationParamVenues(
    query: QueryParamDto,
  ): SortAndPaginationParamDto {
    const { page, pageSize, sortBy, direction } = query;
    const fieldsValidEnum = Prisma.VenueOrderByRelevanceFieldEnum;
    const sortFieldsValid = Object.values(fieldsValidEnum) as readonly string[];
    const fieldDefault = fieldsValidEnum.name;
    const sort = ParseSingleSort(
      sortFieldsValid,
      fieldDefault,
      direction,
      sortBy,
    );
    const paginationParams: PaginationParams = {
      page,
      pageSize,
    };
    return {
      sort,
      paginationParams,
    };
  }
  // logAndThrowPrismaClientError(
  //   error: Error,
  //   context: string,
  //   resource: string,
  //   fucntionName: string,
  //   statusKey: string,
  // ): never {
  //   const errorPrismaClient = error as PrismaClientKnownRequestError;
  //   const message = getErrorPrismaClient(errorPrismaClient, fucntionName);
  //   this.loggerService.error(message, JSON.stringify(error), context);
  //   throw new ConflictException(
  //     this.i18nService.translate(
  //       `common.${resource}.action.${fucntionName}.${statusKey}`,
  //     ),
  //   );
  // }
}
