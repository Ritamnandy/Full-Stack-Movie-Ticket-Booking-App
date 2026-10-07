
type WellcomeMail = {
    to: string;
    name: string;

};

type VerifyEmail = {
    to: string;
    name:string
    otp: string;
};

type ResetPassword = {
    to: string;
    name:string
    link: string;
};

type ChangedPasswordConfirmation = {
    to: string;
    name:string
};

export type {
    WellcomeMail,
    VerifyEmail,
    ResetPassword,
    ChangedPasswordConfirmation,
};