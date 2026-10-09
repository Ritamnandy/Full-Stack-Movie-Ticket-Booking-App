import type { UserDocument } from "../models/user.models";
import type { Request } from "express";


export interface AuthRequest extends Request
{
    user?: UserDocument
}