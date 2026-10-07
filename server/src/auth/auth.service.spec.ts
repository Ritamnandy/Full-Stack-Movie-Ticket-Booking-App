import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const redisService = { getData: vi.fn(), setData: vi.fn(), deleteData: vi.fn() };
  const mailsService = { sendVerifyEmailMail: vi.fn(), sendWelcomeMail: vi.fn(), sendResetPasswordMail: vi.fn(), sendPasswordChangedMail: vi.fn() };
  const configService = { getOrThrow: vi.fn() };
  const authRepository = { findUserByEmail: vi.fn(), findUserById: vi.fn(), createUser: vi.fn(), setRefreshToken: vi.fn() };
  const jwtService = { signAsync: vi.fn(), verifyAsync: vi.fn() };
  const imagesService = { uploadImage: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      redisService as never,
      mailsService as never,
      configService as never,
      authRepository as never,
      jwtService as never,
      imagesService as never,
    );
  });

  it('rejects registration when the email already exists', async () => {
    authRepository.findUserByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(service.registerUser({ name: 'Ada', email: 'ada@example.com', password: 'password' })).rejects.toThrow(ConflictException);
    expect(redisService.setData).not.toHaveBeenCalled();
    expect(mailsService.sendVerifyEmailMail).not.toHaveBeenCalled();
  });

  it('returns a cached profile without querying the repository', async () => {
    const cachedProfile = { id: 'user-1', name: 'Ada', email: 'ada@example.com' };
    redisService.getData.mockResolvedValue(JSON.stringify(cachedProfile));

    await expect(service.getCurrentUser('user-1')).resolves.toMatchObject({ success: true, user: cachedProfile });
    expect(authRepository.findUserById).not.toHaveBeenCalled();
  });
});
