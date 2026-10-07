import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from './redis/redis.service.js';
import { BullModule } from '@nestjs/bullmq';
import { MailsModule } from './mails/mails.module.js';
import { ImagesModule } from './images/images.module.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module( {
  imports: [
    ConfigModule.forRoot( {
      isGlobal: true,
    } ),
    JwtModule.register( {
      global: true,
    } ),
    PrismaModule,
    AuthModule,
    RedisModule,
    BullModule.forRootAsync( {
      imports: [ RedisModule ],
      useFactory: ( redis: RedisService ) => ( {
        connection: redis.getClient()
      } ),
      inject: [ RedisService ],
    } ),
    ThrottlerModule.forRoot( {
      throttlers: [
        {
          name: "default",
          ttl: 60000,
          limit: 100,
        },

      ],
      errorMessage: 'Too many requests. Please try again later.',
    } ),
    MailsModule,
    ImagesModule,
  ],
  controllers: [ AppController ],
  providers: [ AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
   ],
} )
export class AppModule { }
