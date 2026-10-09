import type { AuthRequest } from "../types/auth.types";
import { ApiError } from "../util/apiError";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../util/asyncHandler";
import type { JwtPaload } from "../types/paload.types";
import type { UserDocument } from "../models/user.models";
import { logger } from "../util/logger";
import { authRepository } from "../repository/user.repository";


const extractTokenFromCookie = ( request: AuthRequest ) =>
{
    const cookieToken = request.cookies[ 'accessToken' ]
    if ( cookieToken )
    {
        return cookieToken
    }
    return extractTokenFromHeader( request )
}

const extractTokenFromHeader = ( request: AuthRequest ): string | undefined =>
{
    const headerToken = request.header( 'Authorization' )
    if ( !headerToken )
    {
        return undefined
    }
    const [ type, token ] = headerToken.split( '' )
    if ( type !== 'Bearer' )
    {
        return undefined;
    }
    return token;
}


export const verifyJwt = asyncHandler( async ( req: AuthRequest, res: Response, next: NextFunction ) =>
{
    try
    {
        const token = extractTokenFromCookie(req)
        if ( !token )
        {
            throw ApiError.unauthorized( "Unauthorized request", [ " accessToken not found " ] )
        }
        const decodedToken: JwtPaload = jwt.verify( token, process.env.JWT_SECRET as string ) as JwtPaload;
        const user: UserDocument | null = await authRepository.getUserById( decodedToken?.id );
        if ( !user || !user.isVerified )
        {
            throw ApiError.unauthorized( "Unauthorized request", [ "User not found" ] );
        }
        req.user = user;
        next();


    } catch ( error )
    {
        if ( error instanceof jwt.TokenExpiredError )
        {
            logger.error( "Token expired", { error: error.message } );

        } else if ( error instanceof jwt.JsonWebTokenError )
        {
            logger.warn( "Invalid or tampered access token", { message: error.message } );
        } else
        {
            logger.error( "Error verifying access token", { message: ( error as Error ).message } )

        }
        throw ApiError.unauthorized( "Unauthorized request", [ "Unauthorized request please login or signup " ] )
    }
} )