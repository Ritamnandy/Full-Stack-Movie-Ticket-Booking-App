import { JwtauthGuard } from './jwtauth.guard.js';

describe('JwtauthGuard', () => {
  it('should be defined', () => {
    expect(new JwtauthGuard()).toBeDefined();
  });
});
