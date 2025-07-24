import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AmenityStatus, Prisma, Venue } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { getErrorPrismaClient } from 'src/common/helpers/catch-error.helper';
import { queryWithPagination } from 'src/common/helpers/paginate.helper';
import { ParseSingleSort } from 'src/common/helpers/parse-sort';
import { getUserOrFail } from 'src/common/helpers/user.helper';
import { BaseResponse } from 'src/common/interfaces/base-response';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from 'src/common/interfaces/paginate-type';
import { AmenityLite, OwnerLite, SpaceLite } from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { buildBaseResponse } from 'src/common/utils/data.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { VENUE_INCLUDE_SUMMARY } from './constant/include.constant';
import { VenueCreationRequestDto } from './dto/requests/venue-creation.request.dto';
import { VenueUpdateRequestDto } from './dto/requests/venue-update.request.dto';
import { VenueCreationResponseDto } from './dto/responses/venue-creation.response.dto';
import { VenueSummaryResponseDto } from './dto/responses/venue-summary.response.dto';
import { VenueSummaryType } from './interfaces/venue-summary.type';
@Injectable()
export class VenueService {
  constructor(
    private readonly i18nService: I18nService,
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
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
      await this.validateAmenities(dto.amenities);
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
  async findVenues(
    query: QueryParamDto,
  ): Promise<PaginationResult<VenueSummaryResponseDto>> {
    const { search, page, pageSize, sortBy, direction } = query;
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
    const queryOptions = {
      where: {
        ...(search ? { name: { contains: search } } : {}),
        status: AmenityStatus.ACTIVE,
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
    const venueData: Prisma.VenueUpdateInput = this.buildDataUpdate(dto, venue);
    if (Object.values(venueData).length === 0)
      return buildBaseResponse(StatusKey.UNCHANGED);
    if (dto?.amenities) {
      await this.validateAmenities(dto.amenities);
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
  private async getPaginatedVenues(
    paginationParams: PaginationParams,
    options: FindOptions,
  ): Promise<PaginationResult<VenueSummaryResponseDto>> {
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
  private async validateAmenities(amenities: number[]) {
    const amenitiesExist = await this.prismaService.amenity.findMany({
      where: { id: { in: amenities } },
      select: { id: true },
    });
    const existingIds = amenitiesExist.map((a) => a.id);
    const missingAmenityIds = amenities.filter(
      (id) => !existingIds.includes(id),
    );
    if (missingAmenityIds.length > 0) {
      throw new BadRequestException({
        message: this.i18nService.translate('common.venue.missingAmenities'),
        missingAmenities: missingAmenityIds,
      });
    }
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
  private buildDataUpdate<T extends object>(dto: T, current: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(dto).filter(
        ([key, value]) =>
          value !== undefined && value !== current[key as keyof T],
      ),
    ) as Partial<T>;
  }
}
