
import type { Request, Response, NextFunction } from "express"


type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>

const asyncHandler = (handler: Handler) => {
    return (req: Request , res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

export { asyncHandler };