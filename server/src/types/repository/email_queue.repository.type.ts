import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from "../email.types";



export interface IEmailQueueRepository
{
    VerificationMail: ( data: VerifyEmail ) => Promise<void>;
    ResetPasswordMail: ( data: ResetPassword ) => Promise<void>;
    WellcomeMail: ( data: WellcomeMail ) => Promise<void>;
    PasswordChangedMail: ( data: ChangedPasswordConfirmation ) => Promise<void>;
}