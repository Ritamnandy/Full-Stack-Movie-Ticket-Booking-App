import "dotenv/config";
import { connectDb } from "./database/database.connect";
import { app } from "./app";
import { logger } from "./util/logger";

const PORT = process.env.PORT || 4000;

connectDb().then(() => {
    app.listen( PORT, () =>
    {
        logger.info( `Server is running on port ${ PORT }` );
    } );
}).catch((error) => {
    logger.error( `Failed to connect to database: ${ error }` );
    process.exit(1);
});