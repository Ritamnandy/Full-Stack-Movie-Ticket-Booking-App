
import crypto from "node:crypto"
import bcrypt from "bcrypt"


const generateOtp = (): string =>
{
    return crypto.randomInt( 100_000, 1_000_000 ).toString();
};
const sha256 = ( value: string ): string =>
    crypto.createHash( 'sha256' ).update( value ).digest( 'hex' )
const safeEqual = ( aOtp: string, bOtp: string ) =>
    aOtp.length === bOtp.length && crypto.timingSafeEqual( Buffer.from( aOtp ), Buffer.from( bOtp ) )

const hashPassword = async ( password: string ) =>
{
    return await bcrypt.hash( password, 10 )
}

const comparePassword = async ( password: string, hashedPassword: string ) =>
{
    return await bcrypt.compare( password, hashedPassword )
}

const rowCryptoToken = () => crypto.randomBytes( 32 ).toString( "hex" )

const hashedCryptoToken = ( token: string ) => crypto.createHash( "sha256" ).update( token ).digest( "hex" )


const apiMessage = ( message: string, user?: object, refreshToken?: string, accessToken?: string, success?: boolean ) =>
{
    return {
        success: success ?? true,
        message,
        user,
        accessToken,
        refreshToken,
    }
}

export
{
    generateOtp,
    hashPassword,
    comparePassword,
    rowCryptoToken,
    hashedCryptoToken,
    apiMessage,
    safeEqual,
    sha256
}