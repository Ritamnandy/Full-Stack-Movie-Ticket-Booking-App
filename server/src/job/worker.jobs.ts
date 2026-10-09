import { Worker, Job } from "bullmq";
import { PasswordChangedMail, QUEUE_NAME, ResetPasswordMail, SECOND_QUEUE_NAME, VerifyEmailMail } from "../constants";
import { sendPasswordChangedMail, sendResetPasswordMail, sendVerifyEmailMail, sendWelcomeEmail } from "../util/mail";
import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from "../types/email.types";
import { logger } from "../util/logger";
import { connection } from "../redis/redis.connect";

// email worker for(verification, reset password mail)
const firstWorker = new Worker( QUEUE_NAME, async ( job: Job ) =>
{
    switch ( job.name )
    {
        case VerifyEmailMail: {
            const { name, otp, toEmail } = job.data as VerifyEmail;
            await sendVerifyEmailMail( { toEmail, name, otp } );
            break;
        }
        case ResetPasswordMail: {
            const { link, name, toEmail } = job.data as ResetPassword;
            await sendResetPasswordMail( { link, name, toEmail } );
            break;
        }
        default:
            logger.warn( `Unknown job name: ${ job.name }` );
            break;
    }
}, {
    connection: {
        url: connection.url
    }, concurrency: 5
} );


// notification worker for(wellcome & password changed mail)
const secondWorker = new Worker( SECOND_QUEUE_NAME, async ( job: Job ) =>
{
    switch ( job.name )
    {
        case 'send-order-confirmed-email': {
            const { name, toEmail } = job.data as WellcomeMail;
            await sendWelcomeEmail( { name, toEmail } );
            break;
        }
        case PasswordChangedMail: {
            const { name, toEmail } = job.data as ChangedPasswordConfirmation;
            await sendPasswordChangedMail( { name, toEmail } );
            break;
        }
        default:
            logger.warn( `Unknown job name: ${ job.name }` );
            break;
    }
}, {
    connection: {
        url: connection.url
    }, concurrency: 5
} );



firstWorker.on( "completed", ( job ) =>
{
    logger.info( `Email job completed: ${ job.id }` );

} )
firstWorker.on( "failed", ( job, err ) =>
{
    logger.error( `Email job failed: ${ job?.id }`, err );

} )

secondWorker.on( "completed", ( job ) =>
{
    logger.info( `Notification job completed: ${ job.id }` );
} )
secondWorker.on( "failed", ( job, err ) =>
{
    logger.error( `Notification job failed: ${ job?.id }`, err );
} )