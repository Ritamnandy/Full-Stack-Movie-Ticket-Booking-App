
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import type { GoogleOauthBody } from '../types/googleauthbody.types.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy( Strategy, 'google' ) {
    private readonly logger = new Logger( GoogleStrategy.name )
    constructor ( private readonly configService: ConfigService )
    {
        super( {
            clientID: configService.getOrThrow( 'GOOGLE_CLIENT_ID' )!,
            clientSecret: configService.getOrThrow( 'GOOGLE_CLIENT_SECRET' )!,
            callbackURL: configService.getOrThrow( 'GOOGLE_CALLBACK_URL' )!,
            scope: [ 'email', 'profile' ],

            passReqToCallback: true,
        } );
    }

    async validate (
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    )
    {
        try
        {
            const profileData: GoogleOauthBody = {
                googleId: profile.id,
                name: profile._json[ 'name' ] as string,
                email: profile._json[ 'email' ] as string,
                profileImage: profile._json[ 'picture' ] as string,
                isEmailVerified: profile._json[ 'email_verified' ] as boolean,
            };
            req.body = profileData;
            this.logger.log( "google oauth profile processed successfully" );
            return req.body;
        } catch ( error )
        {
            this.logger.error( "google oauth profile processing failed", error );
            throw error;
        }
    }
}