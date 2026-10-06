
import 'dotenv/config';
import { connectDB } from "./db/mongoconnect.db";
import app from "./app";

connectDB();

app.listen(3000, () =>
{
    console.log("Server is running on port 3000");
});