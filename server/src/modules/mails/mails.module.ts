import { Module } from '@nestjs/common';
import { MailsService } from './mails.service.js';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './constants.js';
import { MailProcessor } from './mails.processor.js';

@Module( {
  imports: [ BullModule.registerQueue( { name: EMAIL_QUEUE } ) ],
  providers: [ MailsService, MailProcessor ],
  exports: [ MailsService ],
} )
export class MailsModule { }
