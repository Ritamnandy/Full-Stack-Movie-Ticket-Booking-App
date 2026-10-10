import http from "node:http"
import { app } from "../app"
import { serverConfig } from "../config/server.config"
import { connectDb, disconnectDb } from "../database/database.connect";
import { logger } from "../util/logger";
import type { PrimaryMessage } from "./msg";

/**
 * WORKER: own DB connection + HTTP server.
 */

export async function runWorker (): Promise<void>
{
    let server: http.Server | undefined;
    let shuttingDown = false;

    const shutdown = async ( reason: string, exitCode = 0 ) =>
    {
        if ( shuttingDown ) return;
        shuttingDown = true;
        logger.info( `Worker ${ process.pid } shutting down (${ reason })` );

        const forceTimer = setTimeout( () =>
        {
            logger.error( `Worker ${ process.pid } forced exit after timeout` );
            process.exit( 1 );
        }, serverConfig.shutdownTimeoutMs );
        forceTimer.unref();

        try
        {
            if ( server )
            {
                await new Promise<void>( ( resolve ) =>
                {
                    server!.close( () => resolve() ); // stop accepting new connections
                    server!.closeIdleConnections(); // drop idle keep-alive sockets
                } );
            }
            await disconnectDb();
            clearTimeout( forceTimer );
            process.exit( exitCode );
        } catch ( err )
        {
            logger.error( `Error during worker shutdown: ${ err }` );
            process.exit( 1 );
        }
    };

    process.on( "message", ( msg: PrimaryMessage ) =>
    {
        if ( msg?.cmd === "shutdown" ) void shutdown( "primary request" );
    } );
    process.on( "SIGTERM", () => void shutdown( "SIGTERM" ) );
    process.on( "SIGINT", () => void shutdown( "SIGINT" ) );

    process.on( "unhandledRejection", ( reason ) =>
    {
        logger.error( `Unhandled rejection: ${ reason }` );
        void shutdown( "unhandledRejection", 1 );
    } );
    process.on( "uncaughtException", ( err ) =>
    {
        logger.error( `Uncaught exception: ${ err.stack ?? err }` );
        void shutdown( "uncaughtException", 1 );
    } );

    try
    {
        await connectDb();

        server = http.createServer( app );
        server.keepAliveTimeout = serverConfig.keepAliveTimeoutMs;
        server.headersTimeout = serverConfig.headersTimeoutMs;
        server.requestTimeout = serverConfig.requestTimeoutMs;

        server.listen( serverConfig.port, () =>
        {
            logger.info( `Worker ${ process.pid } listening on port ${ serverConfig.port }` );
        } );

        server.on( "error", ( err ) =>
        {
            logger.error( `Server error: ${ err }` );
            void shutdown( "server error", 1 );
        } );
    } catch ( error )
    {
        logger.error( `Worker ${ process.pid } failed to start: ${ error }` );
        process.exit( 1 );
    }
}
