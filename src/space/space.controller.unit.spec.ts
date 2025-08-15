import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import {
  customLoggerMock,
  i18nMock,
  prismaMock,
} from 'src/common/mock/shared-mock';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrentUserExample } from './example/current-user-example';
import { AddManagersRequestExample } from './example/request/add-manager-request';
import { SpaceCreationRequestExmple } from './example/request/space-creation-request';
import { SpaceFilterRequestExample } from './example/request/space-filter-request';
import { SpaceUpdateRequestExample } from './example/request/space-update-request';
import { AddManagerResponseExample } from './example/response/add-manager-response';
import { DeleteSpaceResponseExample } from './example/response/delete-space-response';
import { PanigatedSpacesResponseExample } from './example/response/paginated-space-response';
import { SpaceCreationResponseExample } from './example/response/space-creation-response';
import { SpaceSummaryResponseExample } from './example/response/space-summary-response';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
describe('SpaceController (isolated)', () => {
  let controller: SpaceController;
  let service: SpaceService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        SpaceService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: I18nService, useValue: i18nMock },
        { provide: CustomLogger, useValue: customLoggerMock },
      ],
    }).compile();
    controller = moduleRef.get<SpaceController>(SpaceController);
    service = moduleRef.get<SpaceService>(SpaceService);
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should call service.create and return result', async function () {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(SpaceCreationResponseExample);
      expect(
        await controller.create(CurrentUserExample, SpaceCreationRequestExmple),
      ).toBe(SpaceCreationResponseExample);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExmple,
      );
    });
    it('should throw BadRequestException validation error', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExmple),
      ).rejects.toThrow(BadRequestException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExmple,
      );
    });
    it('should throw NotFoundException if venue not found', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new NotFoundException('common.venue.notFound'));

      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExmple),
      ).rejects.toThrow(NotFoundException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExmple,
      );
    });
    it('should throw BadRequestException if openHour >= closeHour', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('common.venue.invalidTime'));

      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExmple),
      ).rejects.toThrow(BadRequestException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExmple,
      );
    });

    it('should throw BadRequestException if some amenities do not exist', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new BadRequestException('common.amenities.notFound'),
        );
      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExmple),
      ).rejects.toThrow(BadRequestException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExmple,
      );
    });
    it('should throw BadRequestException if prisma client error', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new ConflictException('common.space.action.create.failed'),
        );
      await expect(
        controller.create(CurrentUserExample, SpaceCreationRequestExmple),
      ).rejects.toThrow(ConflictException);
      expect(createSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        SpaceCreationRequestExmple,
      );
    });
  });
  describe('findPublicSpaces', () => {
    it('should call service.findPublicSpaces and return result', async () => {
      const findPublicSpacesSpy = jest
        .spyOn(service, 'findPublicSpaces')
        .mockResolvedValue(PanigatedSpacesResponseExample);
      expect(await controller.findPublicSpaces(SpaceFilterRequestExample)).toBe(
        PanigatedSpacesResponseExample,
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
        controller.findPublicSpaces(SpaceFilterRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(findPublicSpacesSpy).toHaveBeenCalledWith(
        SpaceFilterRequestExample,
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
      expect(
        await controller.addManagers(
          CurrentUserExample,
          1,
          AddManagersRequestExample,
        ),
      ).toBe(AddManagerResponseExample);
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
          AddManagersRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(addManagersSpy).toHaveBeenCalledWith(
        CurrentUserExample,
        1,
        AddManagersRequestExample,
      );
    });
    it('should throw ForbiddenException if user is not manager', async () => {
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
        .mockRejectedValue(new BadRequestException('common.user.notFound'));
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
  });
  describe('spacesManager', () => {
    it('should call service.findSpacesByManagers and return result', async () => {
      const spacesManagerSpy = jest
        .spyOn(service, 'findSpacesByManagers')
        .mockResolvedValue(PanigatedSpacesResponseExample);
      expect(
        await controller.findSpacesByManager(
          CurrentUserExample,
          SpaceFilterRequestExample,
        ),
      ).toBe(PanigatedSpacesResponseExample);
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
          SpaceFilterRequestExample,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(spacesManagerSpy).toHaveBeenCalledWith(
        CurrentUserExample,
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
      expect(await controller.findDetailPublicSpace(1)).toBe(
        SpaceSummaryResponseExample,
      );
      expect(spaceDetailSpy).toHaveBeenCalledWith(1);
    });
    it('should throw BadRequestException if parseIntPipe error', async () => {
      const spaceDetailSpy = jest
        .spyOn(service, 'findDetailPublicSpace')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(controller.findDetailPublicSpace(1)).rejects.toThrow(
        BadRequestException,
      );
      expect(spaceDetailSpy).toHaveBeenCalledWith(1);
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
  });
  describe('update', () => {
    it('should call service.update and return result', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(SpaceSummaryResponseExample);
      expect(await controller.update(1, SpaceUpdateRequestExample)).toBe(
        SpaceSummaryResponseExample,
      );
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
    });
    it('should throw BadRequestException if validation error', async () => {
      const spaceUpdateSpy = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(
        controller.update(1, SpaceUpdateRequestExample),
      ).rejects.toThrow(BadRequestException);
      expect(spaceUpdateSpy).toHaveBeenCalledWith(1, SpaceUpdateRequestExample);
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
      expect(await controller.delete(1)).toBe(DeleteSpaceResponseExample);
      expect(spaceDeleteSpy).toHaveBeenCalledWith(1);
    });
    it('should throw BadRequestException if parseIntPipe error', async () => {
      const spaceDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new BadRequestException('Validation Error'));
      await expect(controller.delete(1)).rejects.toThrow(BadRequestException);
      expect(spaceDeleteSpy).toHaveBeenCalledWith(1);
    });
    it('should throw NotFoundException if space not found', async () => {
      const spaceDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new NotFoundException('common.space.notFound'));
      await expect(controller.delete(1)).rejects.toThrow(NotFoundException);
      expect(spaceDeleteSpy).toHaveBeenCalledWith(1);
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
