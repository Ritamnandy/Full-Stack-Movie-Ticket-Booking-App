import { redis } from "./redis.connect"

const setData = async ( key: string, data: string, ttl: number ) =>
{
    return await redis.set( key, data, 'EX', ttl )
}

const getData = async ( key: string ) =>
{
    return await redis.get( key )
}

const deleteData = async ( key: string ) =>
{
    return await redis.del( key )
}

export
{
    deleteData,
    getData,
    setData
}