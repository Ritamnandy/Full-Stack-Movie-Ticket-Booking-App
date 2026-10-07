import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { EMAIL_QUEUE, PasswordChangedMail, ResetPasswordMail, VerifyEmailMail, WellComeMail } from './constants.js';
import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from './types/mail.types.js';

@Injectable()
export class MailsService
{
    private readonly jobOptions: JobsOptions = {
        attempts: 3,
        backoff: {
            type: 'exponential', // now correctly narrowed via JobsOptions typing
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    };
    constructor ( @InjectQueue( EMAIL_QUEUE ) private readonly mailQueue: Queue ) { }

    async sendWelcomeMail ( data: WellcomeMail )
    {
        await this.mailQueue.add(
            WellComeMail,
            { ...data },
            this.jobOptions,
        );
    }

    async sendVerifyEmailMail ( data: VerifyEmail )
    {
        await this.mailQueue.add(
            VerifyEmailMail,
            { ...data },
            this.jobOptions,
        );
    }

    async sendResetPasswordMail ( data: ResetPassword )
    {
        await this.mailQueue.add(
            ResetPasswordMail,
            { ...data },
            this.jobOptions,
        );
    }

    async sendPasswordChangedMail ( data: ChangedPasswordConfirmation )
    {
        await this.mailQueue.add(
            PasswordChangedMail,
            { ...data },
            this.jobOptions,
        );
    }





}
