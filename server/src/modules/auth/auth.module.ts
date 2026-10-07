
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { RedisModule } from '../redis/redis.module.js';
import { MailsModule } from '../mails/mails.module.js';
import { ImagesModule } from '../images/images.module.js';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { JwtauthGuard } from '../../common/jwtauthGuard/jwtauth.guard.js';
import { RoleGuard } from '../../common/roleGuard/role.guard.js';
@Module( {
  imports: [
    UsersModule,
    RedisModule,
    MailsModule,
    ImagesModule,
    PassportModule
  ],
  controllers: [ AuthController ],
  providers: [ AuthService, GoogleStrategy, JwtauthGuard, RoleGuard ],
  exports: [ AuthService ]
} )
export class AuthModule { }
