
class ApiError extends Error
{
    statusCode: number
    private success: boolean
    data: null
    error: ( string | object )[]
    isOperational: boolean
    constructor ( statusCode: number, message: string, error: ( string | object )[], isOperational: boolean = true, stack: string = "" )
    {
        super( message );
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.data = null
        this.error = error
        this.isOperational = isOperational
        if ( stack )
        {
            this.stack = stack
        } else
        {
            Error.captureStackTrace( this, this.constructor )
        }
    }

    toJSON ()
    {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            error: this.error,
            data: this.data,
            ...( process.env.NODE_ENV !== "production" && { stack: this.stack } ),
        }
    }

    // static factory methods

    static badRequest ( message: string = "Bad request", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 400, message, error )
    }

    static unauthorized ( message: string = "Unauthorized", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 401, message, error )
    }

    static forbidden ( message: string = "Forbidden", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 403, message, error )
    }

    static notFound ( message: string = "Not found", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 404, message, error )
    }

    static conflict ( message: string = "Conflict", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 409, message, error )
    }

    static payLoadTooLarge ( message: string = "Payload too large", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 413, message, error )
    }


    static unprocessableEntity ( message: string = "Unprocessable entity", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 422, message, error )
    }


    static tooManyRequests ( message: string = "Too many requests", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 429, message, error )
    }


    static internalServerError ( message: string = "Internal server error", error: ( string | object )[] = [] ): ApiError
    {
        return new ApiError( 500, message, error )
    }

    static fromMongoDuplicateKey ( field: string )
    {
        return new ApiError( 409, `${ field } already exists`, [ `Duplicate value for field: ${ field }` ] )
    }



}

export { ApiError }