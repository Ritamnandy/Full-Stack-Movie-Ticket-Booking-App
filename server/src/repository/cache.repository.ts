import { redis } from "../redis/redis.connect";
import type { ICacheRepository } from "../types/repository/redis.repository.type";

class CacheRepository implements ICacheRepository
{
    async set ( key: string, value: string, ttlSeconds: number ): Promise<void>
    {
        await redis.set( key, value, "EX", ttlSeconds );
    }
    async get ( key: string ): Promise<string | null>
    {
        return await redis.get( key );
    }
    async delete ( key: string ): Promise<number>
    {
       return await redis.del( key );
    }
    async keepAlive ( key: string, ttlSeconds: number ): Promise<void>
    {
        await redis.expire( key, ttlSeconds );
    }
}


export const cacheRepository = new CacheRepository();