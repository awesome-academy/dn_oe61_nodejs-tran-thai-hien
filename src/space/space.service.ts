import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AmenityStatus,
  Prisma,
  Space,
  SpacePriceUnit,
  SpaceType,
  User,
  Venue,
  VenueStatus,
} from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { Role } from 'src/common/enums/role.enum';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { validateAmenities } from 'src/common/helpers/amenity.helper';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { ParseSingleSort } from 'src/common/helpers/parse-sort';
import { getUserOrFail, validateUsers } from 'src/common/helpers/user.helper';
import { BaseResponse } from 'src/common/interfaces/base-response';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from 'src/common/interfaces/paginate-type';
import {
  AmenityLite,
  OwnerLite,
  PriceLite,
  VenueLite,
} from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { buildBaseResponse } from 'src/common/utils/data.util';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SPACE_MANAGER_INCLUDE,
  SPACE_SUMMARY_INCLUDE,
} from './constant/include.constant';
import { AddManageSpaceRequestDto } from './dto/requests/add-manage-space-request.dto';
import { SpaceCreationRequestDto } from './dto/requests/space-creation-request.dto';
import { SpaceFilterRequestDto } from './dto/requests/space-filter-request.dto';
import { SpaceManagerResponseDto } from './dto/responses/space-manager-response.dto';
import { SpaceSummaryResponseDto } from './dto/responses/space-summary-response.dto';
import { queryWithPagination } from 'src/common/helpers/paginate.helper';
import { SpaceSummaryType } from './interfaces/space-summary.type';

@Injectable()
export class SpaceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly i18nService: I18nService,
    private readonly loggerService: CustomLogger,
  ) {}
  async create(
    currentUser: AccessTokenPayload,
    dto: SpaceCreationRequestDto,
  ): Promise<BaseResponse<SpaceSummaryResponseDto>> {
    const venue = await this.prismaService.venue.findUnique({
      where: {
        id: dto.venueId,
      },
    });
    if (!venue)
      throw new NotFoundException(
        this.i18nService.translate('common.venue.notFound'),
      );
    const user = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    this.ensureCanManageSpace(venue, user, currentUser.role as Role);
    await this.validateSpaceName(dto.name, venue.id);
    if (dto.openHour >= dto.closeHour) {
      throw new BadRequestException('common.venue.invalidTime');
    }
    if (dto?.amenities) {
      await validateAmenities(
        dto.amenities,
        this.prismaService,
        this.i18nService,
      );
    }
    if (dto?.managers) {
      await validateUsers(dto.managers, this.prismaService, this.i18nService);
    }
    const managerIds = [...(dto.managers ?? []), venue.ownerId];
    const spaceData: Prisma.SpaceCreateInput = {
      name: dto.name,
      capacity: dto.capacity,
      openHour: dto.openHour,
      closeHour: dto.closeHour,
      type: dto.type as SpaceType,
      description: dto.description,
      venue: {
        connect: {
          id: venue.id,
        },
      },
      spaceManagers: {
        create: managerIds.map((id) => ({
          manager: {
            connect: { id },
          },
        })),
      },
      spaceAmenities: {
        create: (dto.amenities ?? []).map((id) => ({
          amenity: { connect: { id } },
        })),
      },
      spacePrices: {
        create: dto.prices.map((p) => ({
          unit: p.type as SpacePriceUnit,
          price: p.price,
        })),
      },
    };
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const spaceCreated = await tx.space.create({
          data: spaceData,
          include: SPACE_SUMMARY_INCLUDE,
        });
        return buildBaseResponse(
          StatusKey.SUCCESS,
          this.buildSpaceSummaryDto(spaceCreated),
        );
      });
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        SpaceService.name,
        'space',
        'create',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async addManagers(
    currentUser: AccessTokenPayload,
    spaceId: number,
    dto: AddManageSpaceRequestDto,
  ): Promise<BaseResponse<SpaceManagerResponseDto | null>> {
    const user = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    await validateUsers(dto.userIds, this.prismaService, this.i18nService);
    const space = await this.prismaService.space.findUnique({
      where: {
        id: spaceId,
      },
      include: {
        venue: true,
      },
    });
    if (!space) throw new NotFoundException('common.space.notFound');
    this.ensureCanManageSpace(space.venue, user, currentUser.role as Role);
    const existing = await this.prismaService.spaceManager.findMany({
      where: { spaceId: space.id, managerId: { in: dto.userIds } },
      select: { managerId: true },
    });
    const existingIds = existing.map((e) => e.managerId);
    const newIds = dto.userIds.filter(
      (id) => !existingIds.includes(id) && id !== user.id,
    );
    if (newIds.length == 0) return buildBaseResponse(StatusKey.UNCHANGED, null);
    try {
      await this.prismaService.spaceManager.createMany({
        data: newIds.map((managerId) => ({ spaceId: space.id, managerId })),
      });
      const spaceManagers = await this.prismaService.spaceManager.findMany({
        where: {
          spaceId: space.id,
        },
        include: SPACE_MANAGER_INCLUDE,
      });
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildSpaceManagerResponseDto(space, spaceManagers),
      );
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        SpaceService.name,
        'space',
        'addManager',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async findPublicSpaces(
    filter: SpaceFilterRequestDto,
  ): Promise<PaginationResult<SpaceSummaryResponseDto>> {
    const { page, pageSize, sortBy, direction } = filter;
    const fieldsValidEnum = Prisma.SpaceOrderByRelevanceFieldEnum;
    const sortFieldsValid = Object.values(fieldsValidEnum) as readonly string[];
    const fieldDefault = fieldsValidEnum.name;
    const sort = ParseSingleSort(
      sortFieldsValid,
      fieldDefault,
      direction,
      sortBy,
    );
    console.log('sort', sort);
    const paginationParams: PaginationParams = {
      page,
      pageSize,
    };
    const venueFilter = {
      status: VenueStatus.APPROVED,
      // deletedAt: null,
      ...(filter.city && {
        city: { contains: filter.city },
      }),
      ...(filter.street && {
        street: { contains: filter.street },
      }),
    };
    const queryOptions = {
      where: {
        ...(filter?.name && {
          name: { contains: filter.name },
        }),
        venue: venueFilter,
        ...(filter?.type && {
          type: {
            in: Array.isArray(filter.type)
              ? filter.type.filter(Boolean).length > 0
                ? filter.type
                : undefined
              : [filter.type],
          },
        }),
        ...(filter.priceUnit || filter.minPrice || filter.maxPrice
          ? {
              spacePrices: {
                some: {
                  ...(filter.priceUnit && { unit: filter.priceUnit }),
                  price: {
                    ...(filter.minPrice !== undefined && {
                      gte: filter.minPrice,
                    }),
                    ...(filter.maxPrice !== undefined && {
                      lte: filter.maxPrice,
                    }),
                  },
                },
              },
            }
          : {}),
        ...(filter.startTime && filter.endTime
          ? {
              AND: [
                { openHour: { lte: filter.startTime } },
                { closeHour: { gte: filter.endTime } },
              ],
            }
          : {}),
      },
      include: SPACE_SUMMARY_INCLUDE,
      orderBy: sort,
    };
    console.log(JSON.stringify(queryOptions, null, 2));
    return this.getPaginatedSpaces(paginationParams, queryOptions);
  }
  private buildSpaceSummaryDto(
    data: Space & {
      spaceAmenities: { status: AmenityStatus; amenity: AmenityLite }[];
      venue: VenueLite;
      spacePrices: PriceLite[];
      spaceManagers: { manager: OwnerLite }[];
    },
  ): SpaceSummaryResponseDto {
    return {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      type: data.type,
      description: data.description ?? null,
      openHour: data.openHour,
      closeHour: data.closeHour,
      venueId: data.venue.id,
      venueName: data.venue.name,
      amenities: data.spaceAmenities.map((v) => ({
        id: v.amenity.id,
        name: v.amenity.name,
        status: v.status,
      })),
      prices: data.spacePrices,
      managers: data.spaceManagers.map((sm) => sm.manager),
    };
  }
  private buildSpaceManagerResponseDto(
    data: Space,
    managers: { manager: OwnerLite }[],
  ): SpaceManagerResponseDto {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      managers: managers.map((m) => m.manager),
    };
  }
  private async validateSpaceName(
    name: string,
    venueId: number,
  ): Promise<Space | null> {
    const space = await this.prismaService.space.findUnique({
      where: {
        name_venueId: {
          name,
          venueId,
        },
      },
    });
    if (space)
      throw new BadRequestException(
        this.i18nService.translate('common.space.nameExists'),
      );
    return space;
  }
  private validRoleAction(role: Role): boolean {
    const rolesValid = [Role.MODERATOR, Role.ADMIN];
    return rolesValid.includes(role);
  }
  private ensureCanManageSpace(venue: Venue, user: User, role: Role) {
    if (venue.ownerId !== user.id && !this.validRoleAction(role)) {
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    }
  }
  private async getPaginatedSpaces(
    paginationParams: PaginationParams,
    options: FindOptions,
  ): Promise<PaginationResult<SpaceSummaryResponseDto>> {
    try {
      const spaces = await queryWithPagination(
        this.prismaService.space,
        paginationParams,
        options,
      );
      return {
        ...spaces,
        data: spaces.data.map((v: SpaceSummaryType) =>
          this.buildSpaceSummaryDto(v),
        ),
      };
    } catch (exception) {
      logAndThrowPrismaClientError(
        exception as Error,
        SpaceService.name,
        'space',
        'findPublicSpaces',
        'failed',
        this.loggerService,
        this.i18nService,
      );
    }
  }
}
