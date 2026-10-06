
import mongoose from "mongoose";
import { DB_NAME } from "../constants.ts";

export const connectDB = async () =>
{
    try
    {
        const conn = await mongoose.connect( `${ process.env.MONGO_URL }/${ DB_NAME }` );
        console.log( `MongoDB Connected: ${ conn.connection.host }` );
    } catch ( error )
    {
        if ( error instanceof mongoose.Error )
        {
            console.error( "Error connecting to MongoDB:", error );
            process.exit( 1 );
        }
        throw error instanceof Error ? error.message : new Error( "Something went wrong during database connection" );
    }
};