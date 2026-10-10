
type RegisterData = {
    name: string,
    email: string,
    password: string
}
type resendOtpData = {
    email: string
}

type verifyEmailData = {
    email: string,
    otp: string
}

type loginData = {
    email: string,
    password: string
}

type resetPasswordData = {
    token: string,
    password: string
}

type updateProfileData = {
    name: string,
}
type forgotPasswordData = {
    email: string
}

export type {
    RegisterData,
    resendOtpData,
    verifyEmailData,
    loginData,
    resetPasswordData,
    updateProfileData,
    forgotPasswordData
}

