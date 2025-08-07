import { Test, TestingModule } from '@nestjs/testing';
import { UserViewController } from './user-view.controller';

describe('UserViewController', () => {
  let controller: UserViewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserViewController],
    }).compile();

    controller = module.get<UserViewController>(UserViewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
