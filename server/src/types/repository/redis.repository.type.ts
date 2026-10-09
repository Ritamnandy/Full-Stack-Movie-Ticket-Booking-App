

interface ICacheRepository
{
    set ( key: string, value: string, ttlSeconds: number ): Promise<void>
    get ( key: string ): Promise<string | null>
    delete ( key: string ): Promise<number>
    keepAlive ( key: string, ttlSeconds: number ): Promise<void>
}

export type { ICacheRepository }