import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from "express"
import { Throttle } from '@nestjs/throttler';
import { ResendOtpDto } from './dto/resendotp.dto.js';
import { VerifyEmailDto } from './dto/verifyEmail.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refreshToken.dto.js';
import { JwtauthGuard } from './jwtauthGuard/jwtauth.guard.js';
import type { AuthenticatedRequest } from './types/authentication.type.js';
import { ResetPasswordDto } from './dto/resetPassword.dto.js';
import { RoleGuard } from './roleGuard/role.guard.js';
import { Roles } from '../../common/role/role.decorator.js';
import { UserRole } from '../generated/prisma/enums.js';
import { FileInterceptor } from '@nestjs/platform-express';
import type { GoogleOauthBody } from './types/googleauthbody.types.js';

@Controller( 'auth' )
export class AuthController
{


  private setAuthCookies (
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void
  {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie( 'accessToken', accessToken, {
      httpOnly: true,
      secure: isProd, // must be true in prod (HTTPS); false locally over http
      sameSite: 'strict',
      maxAge: 5 * 60 * 60 * 1000, // 1 hour — match access token expiry
      path: '/',
    } );

    res.cookie( 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days — match refresh token expiry
      path: '/auth/refresh-access-token', // scope it — only sent on the refresh endpoint, reduces exposure
    } );
  }

  constructor (
    private readonly authService: AuthService,
    private readonly configService: ConfigService )
  {

  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'register' )
  @HttpCode( HttpStatus.ACCEPTED )
  async registerUser ( @Body() data: CreateAuthDto )
  {
    const result = await this.authService.registerUser( data );
    return result;
  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'resend-otp' )
  @HttpCode( HttpStatus.OK )
  async resendOtp ( @Body() data: ResendOtpDto )
  {
    return await this.authService.resendOtpCode( data );

  }


  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'verify' )
  @HttpCode( HttpStatus.CREATED )
  async verifyUser ( @Body() data: VerifyEmailDto, @Res( { passthrough: true } ) res: Response )
  {
    const result = await this.authService.verifyEmail( data );
    console.log( result );

    this.setAuthCookies( res, result.accessToken ?? '', result.refreshToken ?? '' );
    return {
      success: result.success,
      message: result.message
    };
  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'login' )
  @HttpCode( HttpStatus.OK )
  async login ( @Body() data: LoginDto, @Res( { passthrough: true } ) res: Response )
  {
    const result = await this.authService.loginUser( data );
    this.setAuthCookies( res, result.accessToken ?? '', result.refreshToken ?? '' );
    return {
      success: result.success,
      message: result.message
    };
  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Patch( 'refresh-access-token' )
  @HttpCode( HttpStatus.OK )
  async refreshAccessToken ( @Body() data: RefreshTokenDto, @Res( { passthrough: true } ) res: Response )
  {
    const result = await this.authService.refreshAccessToken( data.refreshToken );
    this.setAuthCookies( res, result.accessToken ?? '', result.refreshToken ?? '' );
    return {
      success: result.success,
      message: result.message
    };
  }


  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Delete( 'logout' )
  @HttpCode( HttpStatus.OK )
  @UseGuards( JwtauthGuard )
  async logout ( @Res( { passthrough: true } ) res: Response, @Req() req: AuthenticatedRequest )
  {
    const result = await this.authService.logOutUser( req.user.id );
    res.clearCookie( 'accessToken' );
    res.clearCookie( 'refreshToken' );

    return {
      success: result.success,
      message: result.message
    };
  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'forget-password' )
  @HttpCode( HttpStatus.OK )
  async forgotPassword ( @Body() data: ResendOtpDto )
  {
    const result = await this.authService.forgotPassword( data );
    return {
      success: result.success,
      message: result.message
    };
  }


  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Patch( 'reset-password' )
  @HttpCode( HttpStatus.OK )
  async resetPassword ( @Body() data: ResetPasswordDto )
  {
    const result = await this.authService.resetPassword( data );
    return {
      success: result.success,
      message: result.message
    };
  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Get( 'profile' )
  @HttpCode( HttpStatus.OK )
  @UseGuards( JwtauthGuard, RoleGuard )
  @Roles( UserRole.ADMIN, UserRole.USER )
  async getProfile ( @Req() req: AuthenticatedRequest )
  {
    return await this.authService.getCurrentUser( req.user.id );
  }


  @Throttle( {
    default: {
      limit: 10, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'profile-image' )
  @HttpCode( HttpStatus.OK )
  @UseInterceptors(
    FileInterceptor( 'profileImage' ),
  )
  @UseGuards( JwtauthGuard, RoleGuard )
  @Roles( UserRole.ADMIN, UserRole.USER )
  async setProfileImage ( @Req() req: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File )
  {
    console.log( file );

    return await this.authService.setUserImage( file, req.user.id );
  }

  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Post( 'update-profile' )
  @HttpCode( HttpStatus.OK )
  @UseGuards( JwtauthGuard, RoleGuard )
  @Roles( UserRole.ADMIN, UserRole.USER )
  async updateUserProfile ( @Body() data: UpdateAuthDto, @Req() req: AuthenticatedRequest )
  {

    return await this.authService.upDateUserData( req.user.id, data )

  }




  @Throttle( {
    default: {
      limit: 5, // limit each IP to 5 requests per `window`
      ttl: 60_000,
    },
  } )
  @Get( 'google' )
  @UseGuards( PassportAuthGuard( 'google' ) )
  googleLogin ()
  {
    // Passport redirects to Google
  }




  @Get( 'google/callback' )
  @UseGuards( PassportAuthGuard( 'google' ) )
  async googleCallback ( @Body() data: GoogleOauthBody, @Res( { passthrough: true } ) res: Response )
  {
    const response = await this.authService.googleLogin( data );
    this.setAuthCookies( res, response.accessToken ?? '', response.refreshToken ?? '' );
    const homePage = this.configService.getOrThrow( 'SUCCESS_URL' );
    const errorPage = this.configService.getOrThrow( 'ERROR_URL' );
    if ( response.success )
    {

      return res.redirect( homePage );
    }

    return res.redirect( errorPage );
  }



}
