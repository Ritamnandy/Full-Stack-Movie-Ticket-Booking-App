import express, { type Request, type Response, type NextFunction, type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import morgan from "morgan";
import compression from "compression"
import helmet from "helmet"
import requestIp from "request-ip"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { logger } from "./util/logger";
import { ApiError } from "./util/apiError";
import { notFound } from "./middlewares/notfound.middlewares";
import { errorHandler } from "./middlewares/error.middlewares";
import authRoute from "./routes/auth.routes";
import "./job/worker.jobs"
import "./oauth/google.oauth"

const app: Express = express();

app.use( helmet() )

app.use(
    cors( {
        origin: process.env.CORS_ORIGIN as string,
        credentials: true,
    } )
)

app.use( express.json( { limit: "30kb" } ) )

app.use( express.urlencoded( { extended: true, limit: "30kb" } ) )

app.use( cookieParser() )

app.use( compression() )

app.use( requestIp.mw() )

app.use( express.static( "public" ) )

app.use( morgan( "combined", {
    stream: {
        write: ( message: string ) => logger.info( message.trim() )
    }
} ) )

// global rate limiter
const globalRateLimiter = rateLimit( {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    legacyHeaders: false,
    standardHeaders: true,
    keyGenerator: ( req: Request ) =>
    {
        const clientIp = ( req as Request & { clientIp?: string } ).clientIp;
        return ipKeyGenerator( clientIp ?? req.ip ?? "unknown" );
    },
    handler: ( req: Request, res: Response, next: NextFunction ) =>
    {
        const clientIp = ( req as Request & { clientIp?: string } ).clientIp;
        logger.error( `too many request, please try again later`, { ip: clientIp ?? req.ip ?? "unknown", path: req.path } );
        next( ApiError.tooManyRequests( `too many request, please try again later` ) );
    }
} )

app.use( globalRateLimiter )

app.get( "/health", ( req, res ) =>
{
    res.status( 200 ).json( { message: "Server is running!" } );
} )




app.use( "/api/v1/auth", authRoute )


app.use( notFound )

app.use( errorHandler )

export { app }