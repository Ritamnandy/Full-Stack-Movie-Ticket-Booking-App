import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from './modules/redis/redis.service.js';
import { BullModule } from '@nestjs/bullmq';
import { MailsModule } from './modules/mails/mails.module.js';
import { ImagesModule } from './modules/images/images.module.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module.js';

@Module( {
  imports: [
    ConfigModule.forRoot( {
      isGlobal: true,
    } ),
    JwtModule.register( {
      global: true,
    } ),
    AuthModule,
    RedisModule,
    DatabaseModule,
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
