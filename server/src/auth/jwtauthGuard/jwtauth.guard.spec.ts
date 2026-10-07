import { UnauthorizedException } from '@nestjs/common';
import { JwtauthGuard } from './jwtauth.guard.js';

describe('JwtauthGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  const configService = { getOrThrow: vi.fn() };
  let guard: JwtauthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new JwtauthGuard(jwtService as never, configService as never);
  });

  it('rejects requests that have no access token', async () => {
    const request = { cookies: {}, header: vi.fn() };
    const context = { switchToHttp: () => ({ getRequest: () => request }) };

    await expect(guard.canActivate(context as never)).rejects.toThrow(new UnauthorizedException('No authentication token found'));
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('validates a bearer token and attaches its payload to the request', async () => {
    const request: { cookies: Record<string, string>; header: ReturnType<typeof vi.fn>; user?: object } = {
      cookies: {},
      header: vi.fn().mockReturnValue('Bearer access-token'),
    };
    const context = { switchToHttp: () => ({ getRequest: () => request }) };
    configService.getOrThrow.mockReturnValue('jwt-secret');
    jwtService.verifyAsync.mockResolvedValue({ id: 'user-1', role: 'USER' });

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', { secret: 'jwt-secret' });
    expect(request.user).toEqual({ id: 'user-1', role: 'USER' });
  });
});
