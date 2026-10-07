
import type { Request } from 'express';
import type { JwtAccessTokenPaload } from './tokenPayload.typs.js';

export interface AuthenticatedRequest extends Request
{
    user: JwtAccessTokenPaload;
    cookies: Record<string, string | undefined>;
}