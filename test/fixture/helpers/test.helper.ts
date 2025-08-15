import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModuleOpts } from '../dto/module-opts';
import { CusstomLoggerMock, I18nMock, PrismaMock } from '../mock/shared-mock';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { BaseResponse } from 'src/common/interfaces/base-response';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { IArray, IObject } from '../dto/data-type.interface';
import { PaginationResult } from 'src/common/interfaces/paginate-type';

export function createMockService<T extends object>(
  methods: (keyof T)[],
): jest.Mocked<T> {
  const mock = {} as Record<keyof T, jest.Mock>;
  methods.forEach((method) => {
    mock[method] = jest.fn();
  });
  return mock as unknown as jest.Mocked<T>;
}

export async function buildTestingModule<C, S extends object>(
  opts: ModuleOpts<C, S>,
): Promise<{ controller: C; serviceMock: jest.Mocked<S> }> {
  const serviceMock = createMockService<S>(opts.serviceMethods);
  const moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [opts.controller],
    providers: [
      { provide: opts.service, useValue: serviceMock },
      { provide: I18nService, useValue: I18nMock },
      { provide: PrismaService, useValue: PrismaMock },
      { provide: CustomLogger, useValue: CusstomLoggerMock },
      ...(opts.extraProviders || []),
    ],
  })
    .overrideGuard(RoleGuard)
    .useValue({ canActivate: () => true })
    .compile();
  return {
    controller: moduleRef.get<C>(opts.controller),
    serviceMock,
  };
}
export function expectBaseResponse<T>(
  response: BaseResponse<T>,
  expectedData: Partial<T>,
  expectedStatusKey: StatusKey = StatusKey.SUCCESS,
  options?: { checkOptionalFields?: boolean },
) {
  const { checkOptionalFields = false } = options || {};
  expect(response.statusKey).toBe(expectedStatusKey);
  function deepMatch<T>(actual: T, expected: T): void {
    if (Array.isArray(expected)) {
      expect(Array.isArray(actual)).toBe(true);
      (actual as IArray).forEach((item, idx) =>
        deepMatch(item, (expected as IArray)[idx]),
      );
    } else if (expected !== null && typeof expected === 'object') {
      expect(actual).not.toBeNull();
      expect(typeof actual).toBe('object');
      const actualObj = actual as IObject;
      const expectedObj = expected as IObject;
      for (const key of Object.keys(expectedObj)) {
        if (checkOptionalFields && !(key in actualObj)) continue;
        expect(actualObj).toHaveProperty(key);
        deepMatch(actualObj[key], expectedObj[key]);
      }
    } else {
      expect(actual).toEqual(expected);
    }
  }
  deepMatch(response.data, expectedData);
}

export function expectPaginatedResponse<T>(
  response: PaginationResult<T>,
  expectedData: T[],
  expectedMeta: typeof response.meta,
) {
  expect(response.meta).toEqual(expectedMeta);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBe(expectedData.length);
  response.data.forEach((item, idx) => {
    expectBaseResponse(
      { statusKey: StatusKey.SUCCESS, data: item },
      expectedData[idx],
    );
  });
}
