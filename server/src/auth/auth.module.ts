
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './repository/auth.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { MailsModule } from '../mails/mails.module.js';
import { ImagesModule } from '../images/images.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtauthGuard } from './jwtauthGuard/jwtauth.guard.js';
import { RoleGuard } from './roleGuard/role.guard.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
@Module( {
  imports: [
    PrismaModule,
    RedisModule,
    MailsModule,
    ImagesModule,
    PassportModule
  ],
  controllers: [ AuthController ],
  providers: [ AuthService, AuthRepository, JwtauthGuard, RoleGuard, GoogleStrategy ],
} )
export class AuthModule { }
