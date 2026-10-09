import type { UserDocument } from "../models/user.models";
import { authServices } from "../service/auth.service";
import type { AuthRequest } from "../types/auth.types";
import type { GoogleOauthBody } from "../types/googleauthbody.types";
import { ApiError } from "../util/apiError";
import { ApiResponse } from "../util/apiResponse";
import { asyncHandler } from "../util/asyncHandler";
import type { Request, Response } from "express";


function setAuthCookies (
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




const registerController = asyncHandler( async ( req: Request, res: Response ) =>
{

    const response = await authServices.registerUser( req.body );
    return res.status( 202 ).json( ApiResponse.accepted( response.message ) );
} )

const verifyEmailController = asyncHandler( async ( req: Request, res: Response ) =>
{

    const response = await authServices.verifyEmail( req.body );
    setAuthCookies( res, response.accessToken, response.refreshToken );
    return res.status( 200 ).json( ApiResponse.ok( response.message, {} ) );
} )


const resendCodeController = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authServices.resendOtpCode( req.body );
    return res.status( 200 ).json( ApiResponse.ok( response.message, "" ) );
} )

const loginController = asyncHandler( async ( req: Request, res: Response ) =>
{

    const response = await authServices.loginUser( req.body );
    setAuthCookies( res, response.accessToken, response.refreshToken )
    return res.status( 200 ).json( ApiResponse.ok( response.message, {} ) );
} )


const logoutController = asyncHandler( async ( req: Request, res: Response ) =>
{
    const user = req.user as UserDocument
    if ( !user )
    {
        return res.status( 401 ).json( ApiError.unauthorized( "Unauthorized request", [ "User not found" ] ) );
    }
    await authServices.logOutUser( user._id.toString() );
    return res.status( 200 ).json( ApiResponse.ok( "Logout successful", "user logged out successfully" ) );
} )


const refreshTokenController = asyncHandler( async ( req: Request, res: Response ) =>
{
    const { token } = req.body || req.cookies?.refreshToken;
    const response = await authServices.refreshAccessToken( token );
    setAuthCookies( res, response.accessToken, response.refreshToken )
    return res.status( 200 ).json( ApiResponse.ok( response.message, {} ) );
} )


const forgotPasswordController = asyncHandler( async ( req: Request, res: Response ) =>
{
    const response = await authServices.forgotPassword( req.body );
    return res.status( 200 ).json( ApiResponse.ok( response.message, "" ) );
} )


const resetPasswordController = asyncHandler( async ( req: Request, res: Response ) =>
{

    const response = await authServices.resetPassword( req.body );
    return res.status( 200 ).json( ApiResponse.ok( response.message, "" ) );
} )

const getUserController = asyncHandler( async ( req: Request, res: Response ) =>
{
    const user = req.user as UserDocument
    if ( !user )
    {
        return res.status( 401 ).json( ApiError.unauthorized( "Unauthorized request", [ "User not found" ] ) );
    }
    const response = await authServices.getCurrentUser( user._id.toString() );
    return res.status( 200 ).json( ApiResponse.ok( response.message, response.data ) );
} )

const deleteUserPermanently = asyncHandler( async ( req: Request, res: Response ) =>
{
    const user = req.user as UserDocument
    if ( !user )
    {
        return res.status( 401 ).json( ApiError.unauthorized( "Unauthorized request", [ "User not found" ] ) );
    }
    const response = await authServices.deleteUserPermanently( user._id.toString() );
    return res.status( 200 ).json( ApiResponse.ok( response.message, {} ) );
} )

const upDateUserProfileData = asyncHandler( async ( req: Request, res: Response ) =>
{
    const user = req.user as UserDocument
    if ( !user )
    {
        return res.status( 401 ).json( ApiError.unauthorized( "Unauthorized request", [ "User not found" ] ) );
    }
    const response = await authServices.upDateUserData( user._id.toString(), req.body );
    return res.status( 200 ).json( ApiResponse.ok( response.message, {} ) );
} )


// ++++ social login +++++++

const googleLogin = asyncHandler( async ( req: Request, res: Response ) =>
{
    const user = req.user as GoogleOauthBody
    if ( !user )
    {
        return res.status( 401 ).json( ApiError.unauthorized( "Unauthorized request", [ "User not found" ] ) );
        // return res.redirect( process.env.ERROR_URL as string );
    }
    const response = await authServices.googleLogin( user );
    if ( response.success )
    {
        setAuthCookies( res, response.accessToken, response.refreshToken )
        return res.status( 200 ).json( ApiResponse.ok( response.message, response ) );
        // return res.redirect( process.env.SUCCESS_URL as string );
    }

    return res.status( 400 ).json( ApiError.badRequest( response.message, [] ) );
    // return res.redirect( process.env.ERROR_URL as string );


} )

const profileImageController = asyncHandler( async ( req: Request, res: Response ) =>
{
    const user = req.user as UserDocument
    if ( !user )
    {
        return res.status( 401 ).json( ApiError.unauthorized( "Unauthorized request", [ "User not found" ] ) );
    }
    const response = await authServices.setUserImage( req.file as Express.Multer.File, user._id.toString() );
    return res.status( 200 ).json( ApiResponse.ok( response.message, { imageUrl: response.imageUrl } ) );
} )





export
{
    registerController,
    verifyEmailController,
    loginController,
    logoutController,
    refreshTokenController,
    forgotPasswordController,
    resetPasswordController,
    getUserController,
    deleteUserPermanently,
    upDateUserProfileData,
    googleLogin,
    resendCodeController,
    profileImageController
}
