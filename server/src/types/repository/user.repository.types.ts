import type { UserDocument } from "../../models/user.models"
import type { RegisterInput } from "../../validators/user.validators"
import type { GoogleOauthBody } from "../googleauthbody.types"
import type { GetToken } from "../paload.types"




interface IUserRepository
{
    getUserById: ( id: string ) => Promise<UserDocument | null>
    getUserByEmail: ( email: string ) => Promise<UserDocument | null>
    createUser: ( user: RegisterInput ) => Promise<UserDocument | null>
    generateTokenPair: ( user: UserDocument ) => Promise<GetToken | null>
    isPasswordCorrect: ( user: UserDocument, password: string ) => Promise<boolean>
    logout: ( user: UserDocument ) => Promise<boolean>
    setUserPassword: ( user: UserDocument, password: string ) => Promise<boolean>
    updateProfile: ( userId: string, profile: Partial<RegisterInput> ) => Promise<UserDocument | null>
    setUserProfileImage: ( userId: string, profileImage: string ) => Promise<UserDocument | null>
    getUserByGoogleId: ( googleId: string ) => Promise<UserDocument | null>
    loginWithGoogle: ( data: GoogleOauthBody ) => Promise<UserDocument | null>
    linkWithGoogleId: ( user: UserDocument, googleId: string ) => Promise<UserDocument | null>
    deleteUserPermanently: ( userId: string ) => Promise<boolean>
}

export type { IUserRepository }