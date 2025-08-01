import { SpaceOwnerOrManagerGuard } from './space-owner-or-manager-guard.guard';

describe('SpaceOwnerOrManagerGuard', () => {
  it('should be defined', () => {
    expect(new SpaceOwnerOrManagerGuard()).toBeDefined();
  });
});
