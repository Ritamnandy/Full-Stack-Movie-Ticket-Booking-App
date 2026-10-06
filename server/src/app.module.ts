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
    MailsModule,
  ],
  controllers: [ AppController ],
  providers: [ AppService ],
} )
export class AppModule { }
