import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, PasswordChangedMail, ResetPasswordMail, VerifyEmailMail, WellComeMail } from './constants.js';
import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from './types/mail.types.js';
import Nodemailer, { Transporter } from 'nodemailer';
import
{
    welcomeTemplate,
    verifyEmailTemplate,
    resetPasswordTemplate,
    passwordChangedTemplate,
} from './mail.templates.js';


@Processor( EMAIL_QUEUE )
export class MailProcessor extends WorkerHost
{
    private readonly logger = new Logger( MailProcessor.name );
    private readonly transporter: Transporter;

    constructor ()
    {
        super();
        this.transporter = Nodemailer.createTransport( {
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER as string,
                pass: process.env.MAIL_PASSWORD as string,
            },
        } );
        // this.onModuleInit()
        // this.mailgen = new Mailgen( {
        //     theme: 'default',
        //     product: {
        //         name: 'QuickShow',
        //         link: 'https://nestjs.com',
        //     },
        // } );
    }
    async onModuleInit ()
    {
        try
        {
            await this.transporter.verify()
            this.logger.log( 'SMTP connection OK' )
        } catch ( error )
        {
            this.logger.error( 'SMTP connection FAILED', error instanceof Error ? error.message : String( error ) )
        }
    }

    async process ( job: Job )
    {
        this.logger.log(
            `Processing job "${ job.name }" (id: ${ job.id })`,
        );

        try
        {
            let result;
            switch ( job.name )
            {
                case WellComeMail:
                    result = await this.sendWelcomeEmail( job.data );
                    // result = await this.testMail();
                    this.logger.log( 'Welcome email sent job processed' );
                    break;
                case VerifyEmailMail:
                    result = await this.sendVerifyEmailMail( job.data );
                    this.logger.log( 'Verify email sent job processed' );
                    break;
                case ResetPasswordMail:
                    result = await this.sendResetPasswordMail( job.data );
                    this.logger.log( 'Reset password email sent job processed' );
                    break;
                case PasswordChangedMail:
                    result = await this.sendPasswordChangedMail( job.data );
                    this.logger.log( 'Password changed email sent job processed' );
                    break;
                default:
                    throw new Error( `Unknown mail job: ${ job.name }` );
            }

            this.logger.log(
                `Job "${ job.name }" (id: ${ job.id }) sent — messageId: ${ result.messageId }`,
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

    private async testMail ()
    {
        try
        {
            const info = await this.transporter.sendMail( {
                from: `"QuickShow" <${ process.env.MAIL_USER }>`,
                to: 'nandyritam11@gmail.com',
                subject: 'QuickShow Test Mail',
                text: 'Hello from QuickShow',
                html: '<h1>Hello from QuickShow</h1>',
            } );

            console.log( 'MAIL SENT:', info.messageId );

            return info;
        } catch ( error )
        {
            console.error( 'MAIL SEND ERROR:', error );
            throw error;
        }
    }


    private async sendMail (
        to: string,
        subject: string,
        html: string,
    )
    {
        const info = await this.transporter.sendMail( {
            from: `"QuickShow" <${ process.env.MAIL_USER as string }>`,
            to,
            subject,
            html,
        } );
        this.logger.log(
            `Mail response:
        messageId=${ info.messageId }
        accepted=${ JSON.stringify( info.accepted ) }
        rejected=${ JSON.stringify( info.rejected ) }
        response=${ info.response }`,
        );
        return info;

    }

    // ---- one method per email type ----

    private sendWelcomeEmail ( { to, name }: WellcomeMail )
    {
        return this.sendMail( to, `Welcome to QuickShow!`, welcomeTemplate( name ) );
    }

    private sendVerifyEmailMail ( { to, name, otp }: VerifyEmail )
    {
        this.logger.log( `Sending verify email data: ${ JSON.stringify( { to, name, otp } ) }` );
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