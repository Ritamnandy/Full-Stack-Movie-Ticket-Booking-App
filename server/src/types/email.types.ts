
type WellcomeMail = {
    toEmail: string;
    name: string;

};

type VerifyEmail = {
    toEmail: string;
    name: string
    otp: string;
};

type ResetPassword = {
    toEmail: string;
    name: string
    link: string;
};

type ChangedPasswordConfirmation = {
    toEmail: string;
    name: string
};

export type {
    WellcomeMail,
    VerifyEmail,
    ResetPassword,
    ChangedPasswordConfirmation,
};