
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile, VerifyCallback } from "passport-google-oauth20"
import type { GoogleOauthBody } from "../types/googleauthbody.types";

passport.use(
    new GoogleStrategy( {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string
    }, async ( _, __, profile: Profile, done: VerifyCallback ) =>
    {
        try
        {
            const json = profile._json
            const response: GoogleOauthBody = {
                email: json.email as string,
                googleId: profile.id,
                name: json.name as string,
                profileImage: json.picture as string,
                isEmailVerified: json.email_verified as boolean
            }
            done( null, response )
        } catch ( error )
        {
            done( error as Error )
        }
    } )
)