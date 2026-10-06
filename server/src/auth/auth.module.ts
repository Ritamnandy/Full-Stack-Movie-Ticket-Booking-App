import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './repository/auth.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module( {
  imports: [ PrismaModule ],
  controllers: [ AuthController ],
  providers: [ AuthService, AuthRepository ],
} )
export class AuthModule { }
