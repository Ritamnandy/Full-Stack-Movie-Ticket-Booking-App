

import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/apiError";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { logger } from "../util/logger";
const isProduction = process.env.NODE_ENV === "production"

const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) =>
{
    let error: ApiError;

    if ( err instanceof ApiError )
    {
        error = err;
    } else
    {
        let statusCode = 500;
        let message = "Something went wrong";
        let errors: ( object | string )[] = [];
        let isOperational = false;

        if ( err instanceof mongoose.Error.CastError )
        {
            statusCode = 400;
            message = `Invalid ${ err.path }: ${ err.value }`;
            errors = [ message ]
            isOperational = true;
        } else if ( ( err as any )?.code === 11000 )
        {
            statusCode = 409;
            const fields = Object.keys( ( err as any ).keyValue || {} ).join( ", " );
            message = `Duplicate ${ fields } entered`;
            errors = [ message ]
            isOperational = true;
        } else if ( err instanceof mongoose.Error.ValidationError )
        {
            statusCode = 400;
            errors = Object.values( err.errors ).map( ( val ) => val.message );
            message = errors.join( ", " );
            isOperational = true;

        } else if ( err instanceof jwt.JsonWebTokenError )
        {
            statusCode = 401;
            message = "Invalid access token";
            errors = [ "Unauthorized request, please login again" ]
            isOperational = true;
        } else if ( err instanceof jwt.TokenExpiredError )
        {
            statusCode = 401;
            message = "Access token expired";
            errors = [ "Unauthorized request, please login again" ]
            isOperational = true;
        } else if ( err instanceof jwt.NotBeforeError )
        {
            statusCode = 401;
            message = "Access token not active yet";
            errors = [ "Unauthorized request, please login again" ]
            isOperational = true;
        } else if ( err instanceof SyntaxError && 'body' in ( err as any ) )
        {
            statusCode = 400;
            message = "Invalid JSON format in request body";
            errors = [ message ]
            isOperational = true;
        } else if ( err instanceof Error )
        {
            statusCode = ( err as any ).statusCode || 500;
            message = err.message || message;
            errors = [ message ]
            isOperational = true;
        }

        error = new ApiError(
            statusCode,
            message, errors,
            isOperational,
            isProduction ? undefined : ( err as Error ).stack

        );

    }

    if ( error.statusCode >= 500 )
    {
        logger.error(
            `[${ new Date().toISOString() }] ${ req.method } ${ req.originalUrl } -`,
            error
        )
    } else if ( !isProduction )
    {
        logger.warn( `[${ req.method } ${ req.originalUrl }] ${ error.message }` )
    }


    const responseError = isProduction && !error.isOperational ? { success: false, statusCode: error.statusCode, message: "Internal Server Error", errors: [] } : error.toJSON();


    res.status( error.statusCode || 500 ).json( responseError );

}

export { errorHandler }