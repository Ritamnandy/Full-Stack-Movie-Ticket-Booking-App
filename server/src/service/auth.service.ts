import { createHashData, createRowToken, generateOtp, ResetPasswordLink, safeEqual } from "../constants";
import type { UserDocument } from "../models/user.models";
import type { GetToken, RefreshPayLoad } from "../types/paload.types";
import type { IEmailQueueRepository } from "../types/repository/email_queue.repository.type";
import jwt from "jsonwebtoken";
import type { ICacheRepository } from "../types/repository/redis.repository.type";
import type { IUserRepository } from "../types/repository/user.repository.types";
import { ApiError } from "../util/apiError";
import { ApiResponse } from "../util/apiResponse";
import { logger } from "../util/logger";
import { OTP_EXPIRY, OTP_RESEND_COOLDOWN, otpCooldownKey, otpKey, PROFILE_DATA_EXPIRY, profileKey, REGISTER_DATA_EXPIRY, registerKey, resetTokenKey } from "../util/rediskey";
import type { ForgetPasswordInput, LoginInput, RegisterInput, ResendCodeInput, ResetPasswordInput, VerificationInput } from "../validators/user.validators";
import type { GoogleOauthBody } from "../types/googleauthbody.types";
import { cacheRepository } from "../repository/cache.repository";
import { authRepository } from "../repository/user.repository";
import { emailQueueRepository } from "../repository/email_queue.repository";
import { uploadImage } from "../util/imageupload";


class AuthService
{
    constructor (
        private readonly redisService: ICacheRepository,
        private readonly authRepository: IUserRepository,
        private readonly mailsService: IEmailQueueRepository
    ) { }

    private async clearUserProfileCache ( userId: string )
    {
        await this.redisService.delete( profileKey( userId ) )
    }

    private async getTokenPair ( user: UserDocument ): Promise<GetToken | undefined>
    {
        try
        {
            const Tokens = await this.authRepository.generateTokenPair( user )
            if ( !Tokens?.accessToken || !Tokens?.refreshToken )
            {
                logger.error( "Error generating token pair", {
                    userId: user._id,
                } );
                return undefined
            }
            return Tokens
        } catch ( error )
        {
            logger.error( "Error generating token pair", {
                error: ( error as Error ).message,
                stack: ( error as Error ).stack,
            } );
            return undefined

        }

    }

    private async decodeRefreshToken ( refreshToken: string )
    {
        try
        {
            const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET! ) as RefreshPayLoad
            return decoded
        } catch ( error )
        {
            logger.error( "Error decoding refresh token", {
                error: ( error as Error ).message,
                stack: ( error as Error ).stack,
            } );
            throw ApiError.unauthorized( 'Invalid or expired refresh token' )
        }
    }


    public async registerUser ( data: RegisterInput )
    {
        const existingUser = await this.authRepository.getUserByEmail( data.email )
        if ( existingUser )
        {
            throw ApiError.badRequest( 'User with this email already exists' )
        }
        const otp = generateOtp()
        await Promise.all( [
            this.redisService.set( registerKey( data.email ), JSON.stringify( data ), REGISTER_DATA_EXPIRY ),
            this.redisService.set( otpKey( data.email ), otp, OTP_EXPIRY ),
            this.mailsService.VerificationMail( {
                name: data.name,
                toEmail: data.email,
                otp
            } )
        ] )
        logger.info( "User registration issued" )
        return {
            message: "OTP sent successfully , please verify your email"
        }
    }

    async resendOtpCode ( data: ResendCodeInput )
    {
        const cacheUser = await this.redisService.get( registerKey( data.email ) )
        if ( !cacheUser )
        {
            throw ApiError.badRequest( 'Sign Up Session expired, please register again' )
        }
        if ( await this.redisService.get( otpCooldownKey( data.email ) ) )
        {
            throw ApiError.tooManyRequests( 'Please wait before requesting another OTP' )
        }
        const { name } = JSON.parse( cacheUser ) as { name: string }

        const otp = generateOtp()
        await Promise.all( [
            this.redisService.set( otpKey( data.email ), otp, OTP_EXPIRY ),
            this.redisService.set( otpCooldownKey( data.email ), '1', OTP_RESEND_COOLDOWN ),
            this.mailsService.VerificationMail( {
                name: name,
                toEmail: data.email,
                otp
            } )
        ] )
        logger.info( `Verification OTP resent` )
        return {
            message: 'OTP resent successfully , please verify your email'
        }
    }

    async verifyEmail ( data: VerificationInput )
    {
        const cacheUser = await this.redisService.get( registerKey( data.email ) )
        if ( !cacheUser )
        {
            throw ApiError.badRequest( 'Sign Up Session expired, please register again' )
        }

        const otp = await this.redisService.get( otpKey( data.email ) )
        if ( !otp )
        {
            throw ApiError.badRequest( 'OTP expired, please request a new one' )
        }
        if ( !safeEqual( otp, data.otp ) )
        {
            throw ApiError.badRequest( 'Invalid OTP, please try again' )
        }
        const deleted = await this.redisService.delete( otpKey( data.email ) ) // return DEL count
        if ( deleted !== 1 )
        {
            throw ApiError.badRequest( 'OTP already used, please request a new one' )
        }
        const user = JSON.parse( cacheUser ) as RegisterInput
        const createdUser = await this.authRepository.createUser( {
            email: data.email,
            name: user.name,
            password: user.password
        } )
        if ( !createdUser )
        {
            throw ApiError.badRequest( 'Failed to register user, please try again later' )
        }

        const tokenPair = await this.getTokenPair( createdUser )
        if ( !tokenPair )
        {
            throw ApiError.badRequest( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair

        await Promise.all( [
            this.redisService.delete( registerKey( data.email ) ),
            this.redisService.delete( otpKey( data.email ) ),
            this.redisService.delete( otpCooldownKey( data.email ) ),
            this.mailsService.WellcomeMail( {
                name: createdUser.name,
                toEmail: createdUser.email
            } )
        ] )


        logger.info( "User registered successfully" )
        return {
            message: 'User registered successfully',
            accessToken: accessToken!,
            refreshToken: refreshToken!
        }
    }

    async loginUser ( data: LoginInput )
    {
        const result = await this.authRepository.getUserByEmail( data.email )
        if ( !result )
        {
            throw ApiError.notFound( 'User with this email does not exist' )
        }

        const isPasswordValid = await result.comparePassword( data.password )
        if ( !isPasswordValid )
        {
            throw ApiError.badRequest( 'Invalid credentials,Please check your password or email' )
        }

        const tokenPair = await this.getTokenPair( result )
        if ( !tokenPair )
        {
            throw ApiError.badRequest( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair

        logger.info( `User logged in successfully` )
        return {
            message: 'User logged in successfully',
            accessToken: accessToken!,
            refreshToken: refreshToken!
        }
    }

    async logOutUser ( userId: string )
    {
        const result = await this.authRepository.getUserById( userId )
        if ( !result )
        {
            throw ApiError.notFound( 'User with this id does not exist' )
        }
        const response = await this.authRepository.logout( result )
        if ( !response )
        {
            throw ApiError.badRequest( 'Failed to logout user, please try again later' )
        }
        await this.clearUserProfileCache( userId )
        logger.info( `User logged out successfully ` )
        return {
            message: 'User logged out successfully'
        }

    }

    async refreshAccessToken ( refreshTokenData: string )
    {
        const decodedToken = await this.decodeRefreshToken( refreshTokenData )
        const result = await this.authRepository.getUserByEmail( decodedToken.email )
        if ( !result || !result.refreshToken )
        {
            throw ApiError.unauthorized( 'Invalid or expired refresh token' )
        }
        if ( !safeEqual( createHashData( refreshTokenData ), result.refreshToken ) )
        {
            // Valid signature but not the current token => rotated token reused
            await this.authRepository.logout( result )
            await this.clearUserProfileCache( result.id )
            logger.warn( `Refresh token reuse detected for user ${ result.id }` )
            throw ApiError.unauthorized( 'Invalid or expired refresh token' )
        }


        const tokenPair = await this.getTokenPair( result )
        if ( !tokenPair )
        {
            throw ApiError.badRequest( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair
        logger.info( `Refreshed access token` )

        return {
            message: 'Access token refreshed successfully',
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }


    async forgotPassword ( data: ForgetPasswordInput )
    {
        const response = {
            message: 'If an account exists with this email, a password reset link has been sent.',
        }
        const result = await this.authRepository.getUserByEmail( data.email )
        if ( !result )
        {
            return response
        }

        const rowToken = createRowToken()
        const hashedToken = createHashData( rowToken )
        const link = ResetPasswordLink( rowToken )

        await Promise.all( [
            this.redisService.set( resetTokenKey( hashedToken ), result.email, 60 * 10 ),
            this.mailsService.ResetPasswordMail( {
                link: link,
                toEmail: result.email,
                name: result.name
            } )
        ] )
        logger.info( 'Reset password link sent' )
        return response
    }

    async resetPassword ( data: ResetPasswordInput )
    {
        const invalid = () =>
        {
            return { message: 'Invalid or expired reset token' }
        }

        const hashedToken = createHashData( data.token )
        const cachedEmail = await this.redisService.get( resetTokenKey( hashedToken ) )
        if ( !cachedEmail )
        {
            throw invalid()
        }
        const result = await this.authRepository.getUserByEmail( cachedEmail )
        if ( !result )
        {
            throw invalid()
        }
        const response = await this.authRepository.setUserPassword( result, data.password )
        if ( !response )
        {
            throw ApiError.badRequest( 'Failed to reset password, please try again later' )
        }

        await Promise.all( [
            this.redisService.delete( resetTokenKey( hashedToken ) ),
            this.mailsService.PasswordChangedMail( {
                name: result.name,
                toEmail: result.email
            } )
        ] )
        logger.info( `Password reset successfully for ${ cachedEmail }` )
        return {
            message: 'Password reset successfully'
        }
    }

    async upDateUserData ( userId: string, data: Partial<RegisterInput> )
    {
        const user = await this.authRepository.getUserById( userId )
        if ( !user )
        {
            throw ApiError.notFound( 'User not found,Please try to login again' )
        }
        const result = await this.authRepository.updateProfile( userId, data )
        if ( !result )
        {
            throw ApiError.badRequest( 'Failed to update user, please try again later' )
        }
        await this.clearUserProfileCache( userId )
        return { message: 'User updated successfully' }
    }

    async googleLogin ( data: GoogleOauthBody )
    {
        // 1. Google email verification check
        if ( !data.isEmailVerified )
        {
            throw ApiError.unauthorized( 'Google account email is not verified' )
        }
        // 2. First try Google ID
        let user = await this.authRepository.getUserByGoogleId( data.googleId )
        // 3. Google ID not found
        if ( !user )
        {
            // 4. Try email
            const findbyEmail = await this.authRepository.getUserByEmail( data.email )
            if ( findbyEmail )
            {
                // 5. Verified Google email allows linking
                // Safe to link only because Google verified this email
                user = await this.authRepository.linkWithGoogleId( findbyEmail, data.googleId )
            } else
            {
                // 6. Completely new Google user
                try
                {
                    user = await this.authRepository.loginWithGoogle( { ...data } )
                } catch ( error )
                {
                    // 7. Handle concurrent first login
                    // Concurrent first login: the other request already created the user
                    user = await this.authRepository.getUserByGoogleId( data.googleId )
                    if ( !user )
                    {
                        logger.error( 'Google signup failed', error instanceof Error ? error.stack : String( error ) )
                        throw ApiError.badRequest( 'Could not sign in with Google' )
                    }
                }
            }

        }

        // 8. Final safety check
        if ( !user )
        {
            throw ApiError.badRequest( 'Could not sign in with Google' )
        }

        // 9. Generate token pair
        const tokenPair = await this.getTokenPair( user )
        if ( !tokenPair )
        {
            throw ApiError.badRequest( 'Failed to generate token pair, please try again later' )
        }
        const { accessToken, refreshToken } = tokenPair
        logger.info( `User logged in with google` )
        await this.mailsService.WellcomeMail( {
            name: user.name,
            toEmail: user.email
        } )
        // 10. Return response
        return {
            success: true,
            message: 'User logged in successfully',
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    async setUserImage ( file: Express.Multer.File, userId: string )
    {
        // const totalStart = performance.now();

        // console.log( 'File received:', file.size );
        // console.log( file );


        const imageResult = await uploadImage( file.buffer, file.originalname );
        if ( !imageResult || !imageResult.url )
        {
            throw ApiError.badRequest( 'Failed to upload image, please try again later' );
        }


        const response = await this.authRepository.setUserProfileImage( userId, imageResult.url )

        if ( !response )
        {
            throw ApiError.badRequest( 'Failed to set user profile image, please try again later' )

        }
        return {
            message: 'User profile image set successfully',
            imageUrl: response.profileImage
        }
    }

    async deleteUserPermanently ( userId: string )
    {
        const response = await this.authRepository.deleteUserPermanently( userId )

        if ( !response )
        {
            throw ApiError.badRequest( 'Failed to delete user permanently, please try again later' )
        }

        return { message: 'User deleted successfully' }

    }

    async getCurrentUser ( userId: string )
    {
        const cachedUser = await this.redisService.get( profileKey( userId ) )
        if ( cachedUser )
        {
            const user = JSON.parse( cachedUser )
            return {
                message: 'User retrieved successfully',
                data: user
            }
        }

        const result = await this.authRepository.getUserById( userId )
        if ( !result )
        {
            throw ApiError.notFound( 'User not found,Please try to login again' )
        }
        await this.redisService.set( profileKey( userId ), JSON.stringify( {
            id: result._id.toString(),
            email: result.email,
            name: result.name,
            role: result.role,
            profileImage: result.profileImage,
        } ), PROFILE_DATA_EXPIRY )
        return {
            message: 'User retrieved successfully',
            data: {
                id: result._id.toString(),
                email: result.email,
                name: result.name,
                role: result.role,
                profileImage: result.profileImage,
            }
        }
    }


}


export const authServices = new AuthService(
    cacheRepository,
    authRepository,
    emailQueueRepository );