import { MailsService } from './mails.service.js';
import { PasswordChangedMail, ResetPasswordMail, VerifyEmailMail, WellComeMail } from './constants.js';

describe('MailsService', () => {
  let service: MailsService;
  const queue = { add: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MailsService(queue as never);
  });

  it.each([
    ['welcome', WellComeMail, 'sendWelcomeMail', { name: 'Ada', to: 'ada@example.com' }],
    ['verification', VerifyEmailMail, 'sendVerifyEmailMail', { name: 'Ada', to: 'ada@example.com', otp: '123456' }],
    ['reset-password', ResetPasswordMail, 'sendResetPasswordMail', { name: 'Ada', to: 'ada@example.com', link: 'https://example.com/reset' }],
    ['password-changed', PasswordChangedMail, 'sendPasswordChangedMail', { name: 'Ada', to: 'ada@example.com' }],
  ] as const)('queues %s email with retry options', async (_label, jobName, method, payload) => {
    await service[method](payload as never);

    expect(queue.add).toHaveBeenCalledWith(jobName, payload, expect.objectContaining({ attempts: 3, removeOnComplete: true }));
  });
});
