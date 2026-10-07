import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import type { AuthenticatedRequest } from '../../modules/auth/types/authentication.type.js';


@Injectable()
export class JwtauthGuard implements CanActivate
{
  private readonly logger = new Logger( JwtauthGuard.name )

  constructor (
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  )
  {
    this.logger.log( 'JwtauthGuard initialized' );
  }


  async canActivate (
    context: ExecutionContext,
  ): Promise<boolean>
  {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromCookie( request );
    this.logger.log( 'Extracted token:', token );
    if ( !token )
    {
      throw new UnauthorizedException( 'No authentication token found' )
    }

    try
    {
      const payload = await this.jwtService.verifyAsync( token, {
        secret: this.configService.getOrThrow<string>( 'JWT_SECRET' )
      } )
      request.user = payload
    } catch ( error )
    {
      if ( error instanceof TokenExpiredError )
      {
        throw new UnauthorizedException( 'Access token has expired' );
      }
      if ( error instanceof NotBeforeError )
      {
        throw new UnauthorizedException( 'Access token is not yet valid' );
      }
      if ( error instanceof JsonWebTokenError )
      {
        this.logger.error( 'Invalid authentication token:', error.message );
        throw new UnauthorizedException( 'Invalid access token provided' );
      }
      this.logger.warn( 'Invalid authentication token' )
      throw new UnauthorizedException()
    }


    return true
  }


  private extractTokenFromCookie ( request: AuthenticatedRequest ): string | undefined
  {
    const cookieHeader = request.cookies[ 'accessToken' ];
    // this.logger.log( 'Extracting token from cookie:', cookieHeader );
    if ( cookieHeader )
    {

      return cookieHeader;
    }
    return this.extractTokenFromHeader( request );
  }

  extractTokenFromHeader ( request: AuthenticatedRequest ): string | undefined
  {
    const authHeader = request.header( 'Authorization' )
    // this.logger.log( 'Extracting token from header:', authHeader );
    if ( !authHeader )
    {
      return undefined;
    }

    const [ type, token ] = authHeader.split( ' ' );
    if ( type !== 'Bearer' )
    {
      return undefined;
    }
    return token;
  }






}
