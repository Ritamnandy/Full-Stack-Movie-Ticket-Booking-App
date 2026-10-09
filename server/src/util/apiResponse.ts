

class ApiResponse<T = unknown>
{
    statusCode: number
    message: string
    data: T
    private sucess: boolean
    private error: null
    meta?: Record<string, unknown>
    constructor ( statusCode: number, message: string, data: T, meta?: Record<string, unknown> )
    {
        this.statusCode = statusCode
        this.sucess = statusCode < 400
        this.message = message
        this.data = data
        this.meta = meta || {}
        this.error = null
    }

    toJSON ()
    {
        return {
            success: this.sucess,
            statusCode: this.statusCode,
            message: this.message,
            error: this.error,
            data: this.data,
            ...( this.meta && { meta: this.meta } ),
        }
    }


    // static factory methods

    static ok<T> ( message: string = "Success", data: T ): ApiResponse<T>
    {
        return new ApiResponse<T>( 200, message, data )
    }

    static created<T> ( message: string = "Resource created successfully", data: T ): ApiResponse<T>
    {
        return new ApiResponse<T>( 201, message, data )
    }


    static accepted<T> ( data: T, message = "Request accepted" )
    {
        return new ApiResponse<T>( 202, message, data )
    }

    static noContent ( message = "No content" )
    {
        return new ApiResponse<null>( 204, message, null )
    }

    // pagination
    static paginated<T> (
        data: T[],
        page: number,
        limit: number,
        total: number,
        message = "Success"
    )
    {
        return new ApiResponse<T[]>( 200, message, data, {
            page,
            limit,
            total,
            totalPages: Math.ceil( total / limit ),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        } )
    }

}

export { ApiResponse }