
import { Redis } from "ioredis";

const connection = {
    url: process.env.REDIS_URL as string
}

const redis = new Redis( connection.url )

export { redis,connection }