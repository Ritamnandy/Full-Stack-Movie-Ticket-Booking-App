import { RoleGuard } from './role.guard.js';
import { UserRole } from '../../generated/prisma/enums.js';

describe('RoleGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const context = {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user: { role: UserRole.USER } }) }),
  };

  beforeEach(() => vi.clearAllMocks());

  it('allows authenticated users when the route has no role requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(new RoleGuard(reflector as never).canActivate(context as never)).toBe(true);
  });

  it('allows only a user with one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
    const guard = new RoleGuard(reflector as never);

    expect(guard.canActivate(context as never)).toBe(true);
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    expect(guard.canActivate(context as never)).toBe(false);
  });
});
