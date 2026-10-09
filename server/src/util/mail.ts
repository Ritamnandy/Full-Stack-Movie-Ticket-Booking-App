
import Nodemailer from "nodemailer"
import { logger } from "./logger"
import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from "../types/email.types";
import { passwordChangedTemplate, resetPasswordTemplate, verifyEmailTemplate, welcomeTemplate } from "./mail.templates.js";

const transporter = Nodemailer.createTransport( {
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER as string,
        pass: process.env.MAIL_PASSWORD as string,
    },
} );


const sendMail = async (
    to: string,
    subject: string,
    html: string,
) =>
{
    try
    {
        await transporter.sendMail( {
            from: `"QuickShow" <${ process.env.MAIL_USER as string }>`,
            to,
            subject,
            html,
        } );
        logger.info( `Email sent successfully` );
    } catch ( error )
    {
        logger.error( `Failed to send email`, { error } );
        throw error instanceof Error ? error : new Error( "Failed to send verification email" );
    }

}


// ---- one method per email type ----

const sendWelcomeEmail = ( { toEmail, name }: WellcomeMail ) =>
{
    return sendMail( toEmail, `Welcome to QuickShow!`, welcomeTemplate( name ) );
}

const sendVerifyEmailMail = ( { toEmail, name, otp }: VerifyEmail ) =>
{
    return sendMail( toEmail, 'Verify your email', verifyEmailTemplate( otp, name, 5 ) );
}

const sendResetPasswordMail = ( { toEmail, name, link }: ResetPassword ) =>
{
    return sendMail( toEmail, 'Reset your password', resetPasswordTemplate( link, name ) );
}

const sendPasswordChangedMail = ( { toEmail, name }: ChangedPasswordConfirmation ) =>
{
    return sendMail( toEmail, 'Your password was changed', passwordChangedTemplate( name ) );
}

export
{
    sendWelcomeEmail,
    sendVerifyEmailMail,
    sendResetPasswordMail,
    sendPasswordChangedMail,
}