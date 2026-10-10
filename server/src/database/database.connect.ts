
import mongoose from "mongoose";
import { DB_NAME } from "../constants";
import { logger } from "../util/logger";



const URL = `${ process.env.MONGODB_URL as string }/${ DB_NAME }`;


export const connectDb = async () =>
{
    try
    {
        const response = await mongoose.connect( URL );
        logger.info( "Database connected", { port: response.connection.port } );
    } catch ( error )
    {
        if ( error instanceof mongoose.Error )
        {
            logger.error( "Database connection failed", {
                error: error.message,
            } );

        }
        throw error instanceof Error ? error.message : new Error( "Something went wrong during database connection" );
    }
}

export const disconnectDb = async () =>
{
    await mongoose.connection.close();
};