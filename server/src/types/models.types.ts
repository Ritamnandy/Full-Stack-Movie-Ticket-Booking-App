import type { LoginType, UserRoles, UserStatus } from "../constants"

type Iuser = {
    name: string,
    email: string,
    password?: string | null
    status: UserStatus
    role: UserRoles,
    loginType: LoginType
    isVerified: boolean
    googleId?: string |null
    profileImage?: string | null
    refreshToken?: string | null
}

type IuserMethods = {
    generateAccessToken: () => string,
    generateRefreshToken: () => string,
    comparePassword: ( password: string ) => Promise<boolean>
}

export type { Iuser, IuserMethods }