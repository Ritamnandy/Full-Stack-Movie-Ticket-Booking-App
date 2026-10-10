import cluster, { Worker } from "node:cluster";
import { serverConfig } from "../config/server.config";
import { logger } from "../util/logger";
import { SHUTDOWN_MESSAGE } from "./msg";

/**
 * PRIMARY: spawns, monitors and respawns workers. No DB, no HTTP.
 */
export function runPrimary (): void
{
    const { workers: workerCount, maxRestarts, restartWindowMs, shutdownTimeoutMs } = serverConfig;

    logger.info( `Primary ${ process.pid } starting ${ workerCount } workers` );

    cluster.schedulingPolicy = cluster.SCHED_RR; // round-robin
    let shuttingDown = false;
    const restarts: number[] = [];

    for ( let i = 0; i < workerCount; i++ ) cluster.fork();

    cluster.on( "online", ( worker ) =>
    {
        logger.info( `Worker ${ worker.process.pid } online` );
    } );

    cluster.on( "exit", ( worker: Worker, code, signal ) =>
    {
        if ( shuttingDown ) return;

        logger.warn(
            `Worker ${ worker.process.pid } died (code=${ code }, signal=${ signal }). Respawning...`
        );

        const now = Date.now();
        while ( restarts.length && now - ( restarts[ 0 ] as number ) > restartWindowMs ) restarts.shift();
        restarts.push( now );

        if ( restarts.length > maxRestarts )
        {
            logger.error(
                `Workers restarted ${ restarts.length }x in ${ restartWindowMs / 1000 }s. Crash loop, exiting.`
            );
            process.exit( 1 ); // let Docker/K8s/systemd/PM2 handle it
        }

        cluster.fork();
    } );

    const shutdown = ( signal: string ) =>
    {
        if ( shuttingDown ) return;
        shuttingDown = true;
        logger.info( `Primary received ${ signal }. Shutting down workers...` );

        const workers = Object.values( cluster.workers ?? {} ).filter( Boolean ) as Worker[];
        if ( workers.length === 0 ) process.exit( 0 );

        let remaining = workers.length;
        workers.forEach( ( w ) =>
        {
            w.once( "exit", () =>
            {
                if ( --remaining === 0 )
                {
                    logger.info( "All workers stopped. Primary exiting." );
                    process.exit( 0 );
                }
            } );
            w.send( SHUTDOWN_MESSAGE );
        } );

        setTimeout( () =>
        {
            logger.error( "Forced shutdown: workers did not exit in time" );
            workers.forEach( ( w ) => w.process.kill( "SIGKILL" ) );
            process.exit( 1 );
        }, shutdownTimeoutMs + 2_000 ).unref();
    };

    process.on( "SIGTERM", () => shutdown( "SIGTERM" ) );
    process.on( "SIGINT", () => shutdown( "SIGINT" ) );
}