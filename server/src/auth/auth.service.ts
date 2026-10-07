import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException, UploadedFile } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { AuthRepository } from './repository/auth.repository.js';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service.js';
import { MailsService } from '../mails/mails.service.js';
import type { JwtAccessTokenPaload, JwtRefreshTokenPaload } from './types/tokenPayload.typs.js';
import { apiMessage, comparePassword, generateOtp, hashedCryptoToken, hashPassword, rowCryptoToken, safeEqual, sha256 } from './utils/constants.js';
import { OTP_EXPIRY, OTP_RESEND_COOLDOWN, otpCooldownKey, otpKey, PROFILE_DATA_EXPIRY, profileKey, REGISTER_DATA_EXPIRY, registerKey, ResetPasswordLink, resetTokenKey } from './utils/rediskey.js';
import { ResendOtpDto } from './dto/resendotp.dto.js';
import { VerifyEmailDto } from './dto/verifyEmail.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/resetPassword.dto.js';
import type { GoogleOauthBody } from './types/googleauthbody.types.js';
import { ImagesService } from '../images/images.service.js';

@Injectable()
export class AuthService
{
  private readonly logger = new Logger( AuthService.name )

  constructor (
    private readonly redisService: RedisService,
    private readonly mailsService: MailsService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly imageServce: ImagesService
  )
  {
    this.logger.log( 'AuthService initialized' );
  }

  private createPayLoad ( data: JwtRefreshTokenPaload ): { jwtAccessToken: JwtAccessTokenPaload, jwtRefreshToken: JwtRefreshTokenPaload }
  {
    const jwtAccessToken: JwtAccessTokenPaload = {
      id: data.id,
      email: data.email,
      role: data.role,
    }

    const jwtRefreshToken: JwtRefreshTokenPaload = {
      id: data.id,
      email: data.email,
      role: data.role,
    }

    return {
      jwtAccessToken,
      jwtRefreshToken,
    }
  }

  private async generateTokenPair ( jwtpayload: JwtAccessTokenPaload, refreshTokenPayload: JwtRefreshTokenPaload )
  {
    try
    {
      const accessToken = await this.jwtService.signAsync( jwtpayload, {
        secret: this.configService.getOrThrow( 'JWT_SECRET' ),
        expiresIn: this.configService.getOrThrow( 'JWT_EXPIRES_IN' ),
      } )

      const refreshToken = await this.jwtService.signAsync( refreshTokenPayload, {
        secret: this.configService.getOrThrow( 'REFRESH_TOKEN_SECRET' ),
        expiresIn: this.configService.getOrThrow( 'REFRESH_TOKEN_EXPIRES_IN' ),
      } )
      const hashedRefreshToken = sha256( refreshToken );
      await this.authRepository.setRefreshToken( jwtpayload.id, hashedRefreshToken )
      return {
        accessToken,
        refreshToken,
      }
    } catch ( error )
    {
      // Log full details server-side only
      this.logger.error(
        `Failed to generate token pair for user ${ jwtpayload.id }`,
        error instanceof Error ? error.stack : String( error ),
      )

      // Don't leak internals (config keys, DB errors) to the client
      throw new InternalServerErrorException( 'Could not generate authentication tokens' )
    }
  }

  private async decodeRefreshToken ( token: string )
  {
    try
    {
      const payload: JwtRefreshTokenPaload = await this.jwtService.verifyAsync( token, {
        secret: this.configService.getOrThrow( 'REFRESH_TOKEN_SECRET' ),
      } )

      return payload

    } catch ( error )
    {
      if ( error instanceof TokenExpiredError )
      {
        throw new UnauthorizedException( 'Refresh token has expired' );
      }
      if ( error instanceof NotBeforeError )
      {
        throw new UnauthorizedException( 'Refresh token is not yet valid' );
      }
      if ( error instanceof JsonWebTokenError )
      {
        throw new UnauthorizedException( 'Invalid refresh token provided' );
      }
      this.logger.warn( 'Invalid authentication token' )
      throw new UnauthorizedException()
    }
  }


  async registerUser ( data: CreateAuthDto )
  {
    const existingUser = await this.authRepository.findUserByEmail( data.email )

    if ( existingUser )
    {
      throw new ConflictException( 'User with this email already exists' )
    }
    const otp = generateOtp()

    const hashedPassword = await hashPassword( data.password )

    await Promise.all( [
      this.redisService.setData( otpKey( data.email ), otp, OTP_EXPIRY ),
      this.redisService.setData( registerKey( data.email ), JSON.stringify( { ...data, password: hashedPassword } ), REGISTER_DATA_EXPIRY ),
      this.redisService.setData( otpCooldownKey( data.email ), '1', OTP_RESEND_COOLDOWN ), // e.g. 60s
      this.mailsService.sendVerifyEmailMail( {
        name: data.name,
        to: data.email,
        otp
      } )
    ] )

    this.logger.log( `Verification OTP issued` )
    return apiMessage( 'OTP sent successfully , please verify your email' )
  }


  async resendOtpCode ( data: ResendOtpDto )
  {
    const cacheUser = await this.redisService.getData( registerKey( data.email ) )
    if ( !cacheUser )
    {
      throw new BadRequestException( 'Sign Up Session expired, please register again' )
    }
    if ( await this.redisService.getData( otpCooldownKey( data.email ) ) )
    {
      throw new HttpException( 'Please wait before requesting another OTP', HttpStatus.TOO_MANY_REQUESTS )
    }
    const { name } = JSON.parse( cacheUser ) as { name: string }

    const otp = generateOtp()
    await Promise.all( [
      this.redisService.setData( otpKey( data.email ), otp, OTP_EXPIRY ),
      this.redisService.setData( otpCooldownKey( data.email ), '1', OTP_RESEND_COOLDOWN ),
      this.mailsService.sendVerifyEmailMail( {
        name: name,
        to: data.email,
        otp
      } )
    ] )
    this.logger.log( `Verification OTP resent` )
    return apiMessage( 'OTP resent successfully , please verify your email' )
  }

  async verifyEmail ( data: VerifyEmailDto )
  {
    const cacheUser = await this.redisService.getData( registerKey( data.email ) )
    if ( !cacheUser )
    {
      throw new BadRequestException( 'Sign Up Session expired, please register again' )
    }

    const otp = await this.redisService.getData( otpKey( data.email ) )
    if ( !otp )
    {
      throw new BadRequestException( 'OTP expired, please request a new one' )
    }
    if ( !safeEqual( otp, data.otp ) )
    {
      throw new BadRequestException( 'Invalid OTP, please try again' )
    }
    const deleted = await this.redisService.deleteData( otpKey( data.email ) ) // return DEL count
    if ( deleted !== 1 )
    {
      throw new BadRequestException( 'OTP already used, please request a new one' )
    }
    const user = JSON.parse( cacheUser ) as CreateAuthDto
    const createdUser = await this.authRepository.createUser( {
      email: data.email,
      name: user.name,
      password: user.password
    } )
    if ( !createdUser )
    {
      throw new BadRequestException( 'Failed to register user, please try again later' )
    }

    const { jwtAccessToken, jwtRefreshToken } = this.createPayLoad( {
      email: data.email,
      role: createdUser.role,
      id: createdUser.id
    } )

    const { accessToken, refreshToken } = await this.generateTokenPair( jwtAccessToken, jwtRefreshToken )

    await Promise.all( [
      this.redisService.deleteData( registerKey( data.email ) ),
      this.redisService.deleteData( otpKey( data.email ) ),
      this.redisService.deleteData( otpCooldownKey( data.email ) ),
      this.mailsService.sendWelcomeMail( {
        name: createdUser.name,
        to: createdUser.email
      } )
    ] )


    this.logger.log( `User registered successfully` )
    return apiMessage( 'User registered successfully', {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      profileImage: createdUser.profileImage
    }, accessToken, refreshToken )
  }

  async loginUser ( data: LoginDto )
  {
    const result = await this.authRepository.findUserByEmail( data.email )
    if ( !result )
    {
      throw new BadRequestException( 'User with this email does not exist' )
    }

    const isPasswordValid = await comparePassword( data.password, result.password as string )
    if ( !isPasswordValid )
    {
      throw new BadRequestException( 'Invalid credentials,Please check your password' )
    }
    const { jwtAccessToken, jwtRefreshToken } = this.createPayLoad( {
      email: data.email,
      role: result.role,
      id: result.id
    } )

    const { accessToken, refreshToken } = await this.generateTokenPair( jwtAccessToken, jwtRefreshToken )
    this.logger.log( `User logged in successfully` )
    return apiMessage( 'User logged in successfully', {
      id: result.id,
      email: result.email,
      role: result.role,
      profileImage: result.profileImage
    }, accessToken, refreshToken )
  }


  async logOutUser ( userId: string )
  {
    const result = await this.authRepository.findUserById( userId )
    if ( !result )
    {
      throw new BadRequestException( 'User with this id does not exist' )
    }
    const response = await this.authRepository.logoutUser( userId )
    await this.clearUserProfileCache( userId )
    this.logger.log( `User logged out successfully ` )
    return apiMessage( 'User logged out successfully' )

  }

  async refreshAccessToken ( refreshTokenData: string )
  {
    const decodedToken = await this.decodeRefreshToken( refreshTokenData )
    const result = await this.authRepository.findUserByEmail( decodedToken.email )
    if ( !result || !result.refreshToken )
    {
      throw new UnauthorizedException( 'Invalid or expired refresh token' )
    }
    if ( !safeEqual( sha256( refreshTokenData ), result.refreshToken ) )
    {
      // Valid signature but not the current token => rotated token reused
      await this.authRepository.logoutUser( result.id )
      await this.clearUserProfileCache( result.id )
      this.logger.warn( `Refresh token reuse detected for user ${ result.id }` )
      throw new UnauthorizedException( 'Invalid or expired refresh token' )
    }
    const { jwtAccessToken, jwtRefreshToken } = this.createPayLoad( {
      email: result.email,
      role: result.role,
      id: result.id
    } )

    const { accessToken, refreshToken } = await this.generateTokenPair( jwtAccessToken, jwtRefreshToken )
    this.logger.log( `Refreshed access token` )

    return apiMessage( 'Access token refreshed successfully', {},
      accessToken,
      refreshToken
    )
  }

  async forgotPassword ( data: ResendOtpDto )
  {
    const response = apiMessage(
      'If an account exists with this email, a password reset link has been sent.',
    )
    const result = await this.authRepository.findUserByEmail( data.email )
    if ( !result )
    {
      return response
    }

    const rowToken = rowCryptoToken()
    const hashedToken = hashedCryptoToken( rowToken )
    const link = ResetPasswordLink( rowToken )

    await Promise.all( [
      this.redisService.setData( resetTokenKey( hashedToken ), result.email, 60 * 10 ),
      this.mailsService.sendResetPasswordMail( {
        link: link,
        to: result.email,
        name: result.name
      } )
    ] )
    this.logger.log( 'Reset password link sent' )

    return response
  }

  async resetPassword ( data: ResetPasswordDto )
  {
    const invalid = () => new BadRequestException( 'Invalid or expired reset token' )

    const hashedToken = hashedCryptoToken( data.token )
    const cachedEmail = await this.redisService.getData( resetTokenKey( hashedToken ) )
    if ( !cachedEmail )
    {
      throw invalid()
    }
    const result = await this.authRepository.findUserByEmail( cachedEmail )
    if ( !result )
    {
      throw invalid()
    }

    const hashedPassword = await hashPassword( data.password )
    await Promise.all( [
      this.authRepository.updateUserPassword( result.id, hashedPassword ),
      this.redisService.deleteData( resetTokenKey( hashedToken ) ),
      this.mailsService.sendPasswordChangedMail( {
        name: result.name,
        to: result.email
      } )
    ] )
    this.logger.log( `Password reset successfully for ${ cachedEmail }` )
    return apiMessage( 'Password reset successfully' )
  }


  async getCurrentUser ( userId: string )
  {
    const cachedUser = await this.redisService.getData( profileKey( userId ) )
    if ( cachedUser )
    {
      const user = JSON.parse( cachedUser )
      return apiMessage( 'User retrieved successfully', user )
    }

    const result = await this.authRepository.findUserById( userId )
    if ( !result )
    {
      throw new NotFoundException( 'User not found,Please try to login again' )
    }
    await this.redisService.setData( profileKey( userId ), JSON.stringify( {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
      image: result.profileImage,
      createAt: result.createdAt
    } ), PROFILE_DATA_EXPIRY )
    return apiMessage( 'User retrieved successfully', result )
  }

  private async clearUserProfileCache ( userId: string )
  {
    await this.redisService.deleteData( profileKey( userId ) )
    return apiMessage( 'User profile cache cleared' )
  }

  async upDateUserData ( userId: string, data: UpdateAuthDto )
  {
    const user = await this.authRepository.findUserById( userId )
    if ( !user )
    {
      throw new NotFoundException( 'User not found,Please try to login again' )
    }
    const result = await this.authRepository.updateUser( userId, data )
    await this.clearUserProfileCache( userId )
    return apiMessage( 'User updated successfully', result )
  }


  async googleLogin ( data: GoogleOauthBody )
  {
    // 1. Google email verification check
    if ( !data.isEmailVerified )
    {
      throw new UnauthorizedException( 'Google account email is not verified' )
    }
    // 2. First try Google ID
    let user = await this.authRepository.findUserByGoogleId( data.googleId )
    // 3. Google ID not found
    if ( !user )
    {
      // 4. Try email
      const findbyEmail = await this.authRepository.findUserByEmail( data.email )
      if ( findbyEmail )
      {
        // 5. Verified Google email allows linking
        // Safe to link only because Google verified this email
        user = await this.authRepository.linkGoogleAccount( findbyEmail.id, data.googleId )
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
          user = await this.authRepository.findUserByGoogleId( data.googleId )
          if ( !user )
          {
            this.logger.error( 'Google signup failed', error instanceof Error ? error.stack : String( error ) )
            throw new InternalServerErrorException( 'Could not sign in with Google' )
          }
        }
      }

    }

    // 8. Final safety check
    if ( !user )
    {
      throw new UnauthorizedException( 'Could not sign in with Google' )
    }

    // 9. Create JWT payload
    const { jwtAccessToken, jwtRefreshToken } = this.createPayLoad( {
      email: user.email,
      id: user.id,
      role: user.role,
    } )

    // 10. Generate token pair
    const { accessToken, refreshToken } = await this.generateTokenPair( jwtAccessToken, jwtRefreshToken )
    this.logger.log( `User logged in with google` )

    // 11. Return response
    return apiMessage( 'User logged in successfully', {}, accessToken, refreshToken )
  }

  async setUserImage ( @UploadedFile() file: Express.Multer.File, userId: string )
  {
    const totalStart = performance.now();

    console.log( 'File received:', file.size );


    const imageResult = await this.imageServce.uploadImage( file, '/user-profile/image' );
    if ( !imageResult || !imageResult.url )
    {
      throw new ConflictException( 'Failed to upload image, please try again later' );
    }

    const response = await this.authRepository.setProfileImage( userId, imageResult.url )

    if ( !response )
    {
      throw new BadRequestException( 'Failed to set user profile image, please try again later' )

    }
    await this.redisService.deleteData( `user:profile:${ userId }` )
    return apiMessage( 'User profile image set successfully', { imageUrl: response.profileImage } )
  }


}
