

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError } from "../util/apiError";


type ValidationTarget = "body" | "params" | "query";

export const validate = <T extends z.ZodType> (
    schema: T,
    target: ValidationTarget = "body"
) =>
{
    return ( req: Request, res: Response, next: NextFunction ) =>
    {
        const result = schema.safeParse( req[ target ] );
        if ( !result.success )
        {
            const errors = Object.entries( result.error.flatten().fieldErrors )

            return next(
                ApiError.unprocessableEntity( "Validation error", errors )
            )
        }
        req[ target ] = result.data
        next()
    }
}