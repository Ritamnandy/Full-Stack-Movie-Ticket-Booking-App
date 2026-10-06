import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Redis } from "ioredis"
@Injectable()
export class RedisService implements OnModuleDestroy
{
    private readonly logger = new Logger( RedisService.name )
    private readonly redis: Redis
    constructor ( private readonly configService: ConfigService )
    {
        const redisUrl = configService.getOrThrow<string>( "REDIS_HOST" )
        this.redis = new Redis( redisUrl )
        this.redis.on( 'error', ( error ) =>
        {
            this.logger.error( 'Redis error:', error )
        } )
        this.redis.on( 'connect', () => this.logger.log( 'Redis connected' ) )
    }

    async getData ( key: string )
    {
        return await this.redis.get( key )
    }

    async setData ( key: string, data: string, ttl: number )
    {
        return await this.redis.set( key, data, 'EX', ttl )
    }

    async deleteData ( key: string )
    {
        return await this.redis.del( key )
    }

    async getClient ()
    {
        return this.redis
    }

    async onModuleDestroy ()
    {
        await this.redis.quit()
    }
}
