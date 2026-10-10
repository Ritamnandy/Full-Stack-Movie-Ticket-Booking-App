import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error
{
    status: number;
    constructor ( message: string, status: number )
    {
        super( message );
        this.status = status;
    }
}

const client = axios.create( {
    baseURL: BASE_URL,
    withCredentials: true, // send and receive the auth cookies
    headers: { "Content-Type": "application/json" },
} );

// Paths that must never trigger a refresh attempt
const NO_REFRESH_PATHS = [ "/auth/refreshtoken", "/auth/login" ];

// Share one refresh call if several requests hit 401 at the same time
let refreshPromise: Promise<unknown> | null = null;

client.interceptors.response.use(
    ( res ) => res,
    async ( error: AxiosError ) =>
    {
        const original = error.config as
            | ( AxiosRequestConfig & { _retry?: boolean } )
            | undefined;

        if (
            error.response?.status === 401 &&
            original &&
            !original._retry &&
            !NO_REFRESH_PATHS.includes( original.url ?? "" )
        )
        {
            original._retry = true;
            try
            {
                refreshPromise ??= client
                    .post( "/auth/refreshtoken" )
                    .finally( () => ( refreshPromise = null ) );
                await refreshPromise;
                return client( original ); // retry once
            } catch
            {
                // refresh failed, fall through and surface the original 401
            }
        }

        return Promise.reject( error );
    }
);

type ApiOptions = Omit<AxiosRequestConfig, "url" | "method" | "data"> & {
    method?: AxiosRequestConfig[ "method" ];
    body?: unknown;
    /** Show a success toast when the request succeeds */
    successMessage?: string;
    /** Skip the automatic error toast (e.g. when the form shows its own error) */
    silent?: boolean;
};

export async function api<T = unknown> (
    path: string,
    { body, method = "GET", successMessage, silent = false, ...config }: ApiOptions = {}
): Promise<T>
{
    try
    {
        const res = await client.request<T>( {
            url: path,
            method,
            data: body,
            ...config,
        } );
        if ( successMessage ) console.log( successMessage );
        ;
        return res.data;
    } catch ( err )
    {
        console.log( silent );
        
        // Aborted requests (AbortController) are not errors worth showing
        if ( axios.isCancel( err ) ) throw err;

        if ( axios.isAxiosError( err ) )
        {
            const data = err.response?.data as { message?: string | string[] } | undefined;
            const serverMessage = Array.isArray( data?.message ) ? data.message[ 0 ] : data?.message;

            const message = err.response
                ? serverMessage ?? "Something went wrong. Please try again."
                : "Network error. Please check your connection.";

            // `id` dedupes identical toasts fired by parallel requests


            throw new ApiError( message, err.response?.status ?? 0 );
        }
        throw err;
    }
}