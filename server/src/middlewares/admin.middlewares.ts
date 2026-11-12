import type { NextFunction, Request, Response } from "express";
import type { UserDocument } from "../models/user.models";
import { ApiError } from "../util/apiError";
import { UserRoles } from "../constants";

// must run after verifyJwt
export const adminOnly = ( req: Request, res: Response, next: NextFunction ) =>
{
    const user = req.user as UserDocument | undefined
    if ( user?.role !== UserRoles.ADMIN )
    {
        return next( ApiError.forbidden( "Admin access required", [ "Forbidden" ] ) );
    }
    next()
}
