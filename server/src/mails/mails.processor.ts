import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { EMAIL_QUEUE, PasswordChangedMail, ResetPasswordMail, VerifyEmailMail, WellComeMail } from './constants.js';
import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from './types/mail.types.js';
import
{
    welcomeTemplate,
    verifyEmailTemplate,
    resetPasswordTemplate,
    passwordChangedTemplate,
} from './mail.templates.js';



@Processor( EMAIL_QUEUE, { concurrency: 5, limiter: { max: 2, duration: 1000 } } )
export class MailProcessor extends WorkerHost
{
    private readonly logger = new Logger( MailProcessor.name );
    private readonly resend: Resend;

    constructor ( private readonly config: ConfigService )
    {
        super();
        this.resend = new Resend( this.config.get( 'RESEND_API_KEY' ) );
    }

    async process ( job: Job )
    {
        this.logger.log(
            `Processing job "${ job.name }" (id: ${ job.id }) for ${ job.data ?? 'unknown' }`,
        );

        try
        {
            let result;
            switch ( job.name )
            {
                case WellComeMail:
                    result = await this.sendWelcomeEmail( job.data );
                    break;
                case VerifyEmailMail:
                    result = await this.sendVerifyEmailMail( job.data );
                    break;
                case ResetPasswordMail:
                    result = await this.sendResetPasswordMail( job.data );
                    break;
                case PasswordChangedMail:
                    result = await this.sendPasswordChangedMail( job.data );
                    break;
                default:
                    throw new Error( `Unknown mail job: ${ job.name }` );
            }

            this.logger.log(
                `Job "${ job.name }" (id: ${ job.id }) sent — messageId: ${ result.id }`,
            );
            return result;
        } catch ( err )
        {
            this.logger.error(
                `Job "${ job.name }" (id: ${ job.id }) failed: ${ ( err as Error ).message }`,
                ( err as Error ).stack,
            );
            throw err; // re-throw so BullMQ still marks it failed & retries per your Options
        }
    }


    private async sendMail (
        to: string,
        subject: string,
        html: string,
    )
    {
        const { data, error } = await this.resend.emails.send( {
            from: this.config.getOrThrow( 'MAIL_FROM' )!,
            to,
            subject,
            html,
        } );

        // Resend returns { data, error } instead of throwing,
        // so you must throw yourself for BullMQ to retry.
        if ( error ) throw new Error( `${ error.name }: ${ error.message }` );

        return data; // { id: '...' }

    }

    // ---- one method per email type ----

    private sendWelcomeEmail ( { to, name }: WellcomeMail )
    {
        return this.sendMail( to, `Welcome to YourApp!`, welcomeTemplate( name ) );
    }

    private sendVerifyEmailMail ( { to, name, otp }: VerifyEmail )
    {
        return this.sendMail( to, 'Verify your email', verifyEmailTemplate( otp, name, 5 ) );
    }

    private sendResetPasswordMail ( { to, name, link }: ResetPassword )
    {
        return this.sendMail( to, 'Reset your password', resetPasswordTemplate( link, name ) );
    }

    private sendPasswordChangedMail ( { to, name }: ChangedPasswordConfirmation )
    {
        return this.sendMail( to, 'Your password was changed', passwordChangedTemplate( name ) );
    }




    @OnWorkerEvent( 'completed' )
    onCompleted ( job: Job )
    {
        this.logger.log( `Email job ${ job.id } sent` );
    }

    @OnWorkerEvent( 'failed' )
    onFailed ( job: Job, err: Error )
    {
        this.logger.error( `Email job ${ job.id } failed: ${ err.message }` );
    }
}