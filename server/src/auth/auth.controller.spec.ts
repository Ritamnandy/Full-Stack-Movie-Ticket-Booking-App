import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    loginUser: vi.fn(),
    getCurrentUser: vi.fn(),
  };
  const configService = { getOrThrow: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(authService as unknown as AuthService, configService as never);
  });

  it('sets authentication cookies and returns only the public login response', async () => {
    authService.loginUser.mockResolvedValue({
      success: true,
      message: 'User logged in successfully',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    const response = { cookie: vi.fn() } as unknown as Response;

    await expect(controller.login({ email: 'ada@example.com', password: 'password' }, response)).resolves.toEqual({
      success: true,
      message: 'User logged in successfully',
    });

    expect(authService.loginUser).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password' });
    expect(response.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.objectContaining({ httpOnly: true, path: '/' }));
    expect(response.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.objectContaining({ httpOnly: true, path: '/auth/refresh-access-token' }));
  });

  it('uses the authenticated user id when fetching a profile', async () => {
    authService.getCurrentUser.mockResolvedValue({ success: true, data: { id: 'user-1' } });

    await expect(controller.getProfile({ user: { id: 'user-1' } } as never)).resolves.toEqual({ success: true, data: { id: 'user-1' } });
    expect(authService.getCurrentUser).toHaveBeenCalledWith('user-1');
  });
});
