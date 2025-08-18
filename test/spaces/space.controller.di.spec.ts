import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { SpaceController } from 'src/space/space.controller';
import { SpaceService } from 'src/space/space.service';
import { CurrentUserExample } from 'test/fixture/dto/current-user-example';
import {
  buildTestingModule,
  expectBaseResponse,
  expectPaginatedResponse,
} from 'test/fixture/helpers/test.helper';
import { AddManagersRequestExample } from './example/request/add-manager-request';
import { SpaceCreationRequestExample } from './example/request/space-creation-request';
import { SpaceFilterRequestExample } from './example/request/space-filter-request';
import { SpaceUpdateRequestExample } from './example/request/space-update-request';
import {
  AddManagerExample,
  AddManagerResponseExample,
} from './example/response/add-manager-response';
import {
  DeleteSpaceExample,
  DeleteSpaceResponseExample,
} from './example/response/delete-space-response';
import { PaginatedSpacesResponseExample } from './example/response/paginated-space-response';
import {
  SpaceSummaryResponse,
  SpaceSummaryResponseTest,
} from './example/response/space-summary-example';
import { SpaceSummaryResponseExample } from './example/response/space-summary-response-example';
describe('SpaceController (isolated)', () => {
  let controller: SpaceController;
  let service: SpaceService;
  beforeEach(async () => {
    const moduleOps = {
      controller: SpaceController,
      service: SpaceService,
      serviceMethods: [
        'create',
        'update',
        'delete',
        'findPublicSpaces',
        'addManagers',
        'findSpacesByManagers',
        'findDetailPublicSpace',
      ] as (keyof SpaceService)[],
    };
    const moduleBuilt = await buildTestingModule<SpaceController, SpaceService>(
      moduleOps,
    );
    controller = moduleBuilt.controller;
    service = moduleBuilt.serviceMock;
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call service.create and return result', async function () {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(SpaceSummaryResponseExample);
      const response = await controller.create(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
      expectBaseResponse(response, SpaceSummaryResponse);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
    });
    it('should throw BadRequestException validation error', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.create(
          CurrentUserExample,
          null as unknown as typeof SpaceCreationRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        null as unknown as typeof SpaceCreationRequestExample,
      );
    });
    it('should throw UnauthorizedException if user is null', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new UnauthorizedException('common.auth.unauthorized'),
        );
      await expect(
        controller.create(
          null as unknown as AccessTokenPayload,
          SpaceCreationRequestExample,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(createSpy).toHaveBeenCalledWith(
        null as unknown as AccessTokenPayload,
        SpaceCreationRequestExample,
      );
    });
    it('should throw NotFoundException if venue not found', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new NotFoundException('common.venue.notFound'));

      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExample),
      ).rejects.toThrow(NotFoundException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
    });
    it('should throw BadRequestException if openHour >= closeHour', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('common.venue.invalidTime'));

      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
    });
    it('should throw ForbiddenException if user is not owner or manager', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new ForbiddenException('common.auth.forbidden'));
      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExample),
      ).rejects.toThrow(ForbiddenException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
    });
    it('should throw BadRequestException if some amenities do not exist', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new BadRequestException('common.amenities.notFound'),
        );
      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
    });
    it('should throw BadRequestException if prisma client error', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new ConflictException('common.space.action.create.failed'),
        );
      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExample),
      ).rejects.toThrow(ConflictException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExample,
      );
    });
  });
  describe('findPublicSpaces', () => {
    it('should call service.findPublicSpaces and return result', async () => {
      const findPublicSpacesSpy = jest
        .spyOn(service, 'findPublicSpaces')
        .mockResolvedValue(PaginatedSpacesResponseExample);
      const response = await controller.findPublicSpaces(
        SpaceFilterRequestExample,
      );
      expectPaginatedResponse(
        response,
        PaginatedSpacesResponseExample.data,
        PaginatedSpacesResponseExample.meta,
      );
      expect(findPublicSpacesSpy).toHaveBeenCalledWith(
        SpaceFilterRequestExample,
      );
    });
    it('should throw BadRequestException if validation error', async () => {
      const findPublicSpacesSpy = jest
        .spyOn(service, 'findPublicSpaces')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.findPublicSpaces(
          null as unknown as typeof SpaceFilterRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(findPublicSpacesSpy).toHaveBeenCalledWith(
        null as unknown as typeof SpaceFilterRequestExample,
      );
    });
    it('shoud throw ConflictException if prisma client error', async () => {
      const findPublicSpacesSpy = jest
        .spyOn(service, 'findPublicSpaces')
        .mockRejectedValue(
          new ConflictException('common.space.action.findPublicSpaces.failed'),
        );
      await expect(
        controller.findPublicSpaces(SpaceFilterRequestExample),
      ).rejects.toThrow(ConflictException);
      expect(findPublicSpacesSpy).toHaveBeenCalledWith(
        SpaceFilterRequestExample,
      );
    });
  });
  describe('addManagers', () => {
    it('should call service.addManagers and return result', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockResolvedValue(AddManagerResponseExample);
      const response = await controller.addManagers(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
      expectBaseResponse(response, AddManagerExample);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
    });
    it('should throw ForbiddenException if user is not owner or manager', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(new ForbiddenException('common.auth.forbidden'));
      await expect(
        controller.addManagers(
          CurrentUserExample,
          1,
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
    });
    it('should throw BadRequestException if validation error', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.addManagers(
          CurrentUserExample,
          1,
          null as unknown as typeof AddManagersRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        null as unknown as typeof AddManagersRequestExample,
      );
    });
    it('should throw ForbiddenException if spaceId is null or underfiled', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(new BadRequestException('ParseIntPipe Error'));
      await expect(
        controller.addManagers(
          CurrentUserExample,
          null as unknown as number,
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        null as unknown as number,
        AddManagersRequestExample,
      );
    });
    it('should throw NotFoundException if space not found', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(new NotFoundException('common.space.notFound'));
      await expect(
        controller.addManagers(
          CurrentUserExample,
          1,
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
    });
    it('should throw BadRequestException if some users do not exist', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(new BadRequestException('common.user.userMissings'));
      await expect(
        controller.addManagers(
          CurrentUserExample,
          1,
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
    });
    it('should throw ConflictException if prisma client error', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(
          new ConflictException('common.space.action.addManagers.failed'),
        );
      await expect(
        controller.addManagers(
          CurrentUserExample,
          1,
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(ConflictException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
    });
    it('should throw BadRequestException if currentUser is null', async () => {
      const addManagersSpy = jest
        .spyOn(service, 'addManagers')
        .mockRejectedValue(
          new UnauthorizedException('common.auth.unauthorized'),
        );
      await expect(
        controller.addManagers(
          null as unknown as AccessTokenPayload,
          1,
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        null as unknown as AccessTokenPayload,
        1,
        AddManagersRequestExample,
      );
    });
  });
  describe('spacesManager', () => {
    it('should call service.findSpacesByManagers and return result', async () => {
      const spacesManagerSpy = jest
        .spyOn(service, 'findSpacesByManagers')
        .mockResolvedValue(PaginatedSpacesResponseExample);
      const response = await controller.findSpacesByManager(
        CurrentUserExample,
        SpaceFilterRequestExample,
      );
      expectPaginatedResponse(
        response,
        PaginatedSpacesResponseExample.data,
        PaginatedSpacesResponseExample.meta,
      );
      expect(spacesManagerSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceFilterRequestExample,
      );
    });
    it('should throw BadRequestException if validation error', async () => {
      const spacesManagerSpy = jest
        .spyOn(service, 'findSpacesByManagers')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.findSpacesByManager(
          CurrentUserExample,
          null as unknown as typeof SpaceFilterRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(spacesManagerSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        null as unknown as typeof SpaceFilterRequestExample,
      );
    });
    it('should throw BadRequestException if currentUser is null', async () => {
      const spacesManagerSpy = jest
        .spyOn(service, 'findSpacesByManagers')
        .mockRejectedValue(
          new UnauthorizedException('common.auth.unauthorized'),
        );
      await expect(
        controller.findSpacesByManager(
          null as unknown as AccessTokenPayload,
          SpaceFilterRequestExample,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(spacesManagerSpy).toHaveBeenCalledWith(
        null as unknown as AccessTokenPayload,
        SpaceFilterRequestExample,
      );
    });
    it('should throw ConflictException if prisma client error', async () => {
      const spacesManagerSpy = jest
        .spyOn(service, 'findSpacesByManagers')
        .mockRejectedValue(
          new ConflictException(
            'common.space.action.findSpacesByManagers.failed',
          ),
        );
      await expect(
        controller.findSpacesByManager(
          CurrentUserExample,
          SpaceFilterRequestExample,
        ),
      ).rejects.toThrow(ConflictException);
      expect(spacesManagerSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceFilterRequestExample,
      );
    });
  });
  describe('detail', () => {
    it('should call service.findDetailPublicSpace and return result', async () => {
      const spaceDetailSpy = jest
        .spyOn(service, 'findDetailPublicSpace')
        .mockResolvedValue(SpaceSummaryResponseExample);
      const response = await controller.findDetailPublicSpace(1);
      expectBaseResponse(response, SpaceSummaryResponse);
      expect(spaceDetailSpy).toHaveBeenCalledWith(1);
    });
    it('should throw BadRequestException if spaceId is null or underfiled or type error', async () => {
      const spaceDetailSpy = jest
        .spyOn(service, 'findDetailPublicSpace')
        .mockRejectedValue(new BadRequestException('ParseIntPipe Error'));
      await expect(
        controller.findDetailPublicSpace(null as unknown as number),
      ).rejects.toThrow(BadRequestException);
      expect(spaceDetailSpy).toHaveBeenCalledWith(null as unknown as number);
    });
    it('should throw NotFoundException if space not found', async () => {
      const spaceDetailSpy = jest
        .spyOn(service, 'findDetailPublicSpace')
        .mockRejectedValue(new NotFoundException('common.space.notFound'));
      await expect(controller.findDetailPublicSpace(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(spaceDetailSpy).toHaveBeenCalledWith(1);
    });
    it('should throw ConflictException if prisma client error', async () => {
      const spaceDetailSpy = jest
        .spyOn(service, 'findDetailPublicSpace')
        .mockRejectedValue(
          new ConflictException(
            'common.space.action.findDetailPublicSpace.failed',
          ),
        );
      await expect(controller.findDetailPublicSpace(1)).rejects.toThrow(
        ConflictException,
      );
      expect(spaceDetailSpy).toHaveBeenCalledWith(1);
    });
  });
  describe('update', () => {
    it('should call service.update and return result', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(SpaceSummaryResponseExample);
      const response = await controller.update(1, SpaceUpdateRequestExample);
      expectBaseResponse(response, SpaceSummaryResponseTest);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
    it('should throw BadRequestException if validation error', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.update(
          1,
          null as unknown as typeof SpaceUpdateRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(
        1,
        null as unknown as typeof SpaceUpdateRequestExample,
      );
    });
    it('should throw NotFoundException if space not found', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('common.space.notFound'));
      await expect(
        controller.update(1, SpaceUpdateRequestExample),
      ).rejects.toThrow(NotFoundException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
    it('should throw BadRequestException if some amenities do not exist', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new BadRequestException('common.venue.missingAmenities'),
        );
      await expect(
        controller.update(1, SpaceUpdateRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
    it('should throw BadRequestException if some mangers do not exist', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('common.user.missingUsers'));
      await expect(
        controller.update(1, SpaceUpdateRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
    it('should throw BadRequestException if openHour >= closeHour', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('common.venue.invalidTime'));
      await expect(
        controller.update(1, SpaceUpdateRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
    it('should throw BadRequestException if spaceId is null', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('ParseIntPipe Error'));
      await expect(
        controller.update(null as unknown as number, SpaceUpdateRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(
        null as unknown as number,
        SpaceUpdateRequestExample,
      );
    });
    it('should throw ConflictException if prisma client error', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new ConflictException('common.space.action.update.failed'),
        );
      await expect(
        controller.update(1, SpaceUpdateRequestExample),
      ).rejects.toThrow(ConflictException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
  });
  describe('delete', () => {
    it('should call service.delete and return result', async () => {
      const spaceDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockResolvedValue(DeleteSpaceResponseExample);
      const response = await controller.delete(1);
      expectBaseResponse(response, DeleteSpaceExample);
      expect(spaceDeleteSpy).toHaveBeenCalledWith(1);
    });
    it('should throw BadRequestException if spaceId is null', async () => {
      const spaceDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new BadRequestException('ParseIntPipe Error'));
      await expect(
        controller.delete(null as unknown as number),
      ).rejects.toThrow(BadRequestException);
      expect(spaceDeleteSpy).toHaveBeenCalledWith(null as unknown as number);
    });
    it('should throw ConflictException if prisma client error', async () => {
      const spaceDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(
          new ConflictException('common.space.action.delete.failed'),
        );
      await expect(controller.delete(1)).rejects.toThrow(ConflictException);
      expect(spaceDeleteSpy).toHaveBeenCalledWith(1);
    });
  });
});
