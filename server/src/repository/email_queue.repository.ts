


import { PasswordChangedMail, ResetPasswordMail, VerifyEmailMail, WellComeMail } from "../constants";
import { FirstQueue, SecondQueue } from "../job/queue.jobs"
import type { ChangedPasswordConfirmation, ResetPassword, VerifyEmail, WellcomeMail } from "../types/email.types";
import type { IEmailQueueRepository } from "../types/repository/email_queue.repository.type";


const option = {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: true,
    backoff: {
        type: "exponential",
        delay: 1000
    },

}


class EmailQueueRepository implements IEmailQueueRepository
{
    public async VerificationMail ( data: VerifyEmail ): Promise<void>
    {
        await FirstQueue.add( VerifyEmailMail, data, option );
    }

    public async ResetPasswordMail ( data: ResetPassword ): Promise<void>
    {
        await FirstQueue.add( ResetPasswordMail, data, option );
    }



    public async WellcomeMail ( data: WellcomeMail ): Promise<void>
    {
        await SecondQueue.add( WellComeMail, data, option );
    }
    public async PasswordChangedMail ( data: ChangedPasswordConfirmation ): Promise<void>
    {
        await SecondQueue.add( PasswordChangedMail, data, option );
    }
}

export const emailQueueRepository = new EmailQueueRepository();