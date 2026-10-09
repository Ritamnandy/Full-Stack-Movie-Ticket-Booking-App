import type { UserDocument } from "../models/user.models";
import type { IUserRepository } from "../types/repository/user.repository.types";
import { User } from "../models/user.models";
import type { RegisterInput } from "../validators/user.validators";
import { createHashData, LoginType, UserRoles, UserStatus } from "../constants";
import type { GoogleOauthBody } from "../types/googleauthbody.types";
import type { GetToken } from "../types/paload.types";

class UserRepository implements IUserRepository
{
    async getUserById ( id: string ): Promise<UserDocument | null>
    {
        return await User.findById( id );
    }
    public async getUserByEmail ( email: string ): Promise<UserDocument | null>
    {
        return User.findOne( { email } )
    }

    public async createUser ( user: RegisterInput ): Promise<UserDocument | null>
    {
        return await User.create( {
            email: user.email,
            name: user.name,
            password: user.password,
            isVerified: true,
            role: UserRoles.USER,
            loginType: LoginType.EMAIL
        } )
    }

    public async getUserByGoogleId ( googleId: string ): Promise<UserDocument | null>
    {
        return User.findOne( { googleId } )
    }

    public async deleteUserPermanently ( userId: string ): Promise<boolean>
    {
        const response = await User.findOneAndDelete( { _id: userId } )
        return response !== null
    }


    public async isPasswordCorrect ( user: UserDocument, password: string ): Promise<boolean>
    {
        return await user.comparePassword( password )
    }

    public async loginWithGoogle ( data: GoogleOauthBody ): Promise<UserDocument | null>
    {
        return await User.create( {
            email: data.email,
            name: data.name,
            googleId: data.googleId,
            isVerified: data.isEmailVerified,
            profileImage: data.profileImage,
            role: UserRoles.USER,
            loginType: LoginType.GOOGLE
        } )
    }

    public async logout ( user: UserDocument ): Promise<boolean>
    {
        user.refreshToken = null
        user.status = UserStatus.INACTIVE
        const response = await user.save()
        return response !== null
    }

    public async setUserProfileImage ( userId: string, profileImage: string ): Promise<UserDocument | null>
    {
        return await User.findOneAndUpdate( { _id: userId }, { profileImage }, { new: true } )
    }

    public async updateProfile ( userId: string, profile: Partial<RegisterInput> ): Promise<UserDocument | null>
    {
        return await User.findOneAndUpdate( { _id: userId }, profile, { new: true } )
    }

    public async setUserPassword ( user: UserDocument, password: string ): Promise<boolean>
    {
        user.password = password
        const response = await user.save()
        return response !== null
    }

    public async generateTokenPair ( user: UserDocument ): Promise<GetToken | null>
    {
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        const hashedRefreshToken = createHashData( refreshToken )
        user.refreshToken = hashedRefreshToken
        await user.save( { validateBeforeSave: false } )
        return { accessToken, refreshToken }
    }

    public async linkWithGoogleId ( user: UserDocument, googleId: string ): Promise<UserDocument | null>
    {
        user.googleId = googleId
        const response = await user.save()
        return response
    }

}


export const authRepository = new UserRepository()