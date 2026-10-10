import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue, type AuthUser } from "./authcontext";
import { apiRequest } from "../api/apiRequest";
import { ApiError } from "../api/apiError";
import { api } from "../config/api.config";

// Map your backend user (profileImage, ...) to the shape the UI uses
type ApiUser = {
    id?: string;
    name: string;
    email: string;
    role: AuthUser[ "role" ];
    isVerified: boolean;
    profileImage?: string | null;
};

const toAuthUser = ( u: ApiUser ): AuthUser => ( {
    id: u.id ?? "",
    name: u.name,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    avatar: u.profileImage ?? null,
} );

export default function AuthProvider ( { children }: { children: ReactNode } )
{
    const [ user, setUser ] = useState<AuthUser | null>( null );
    const [ loading, setLoading ] = useState( true );

    const refreshUser = useCallback( async () =>
    {
        try
        {
            const localdata = sessionStorage.getItem( 'profiledata' );
            if ( localdata )
            {
                const parsed = JSON.parse( localdata );
                const next = toAuthUser( parsed as ApiUser );
                setUser( next );
                console.log( "profile get from session storage" );

                return next;
            }
            const { data } = await api<ApiUser | { data: ApiUser }>( "/auth/profile", { method: "GET", successMessage: "Profile fetched successfully" } );
            // console.log( data );

            const raw = data ? data : null;
            sessionStorage.setItem( 'profiledata', JSON.stringify( raw ) )
            const next = toAuthUser( raw as ApiUser );
            setUser( next );
            return next;
        } catch ( err )
        {
            // 401 just means "not logged in"
            if ( !( err instanceof ApiError ) || err.status !== 401 ) console.error( err );
            setUser( null );
            return null;
        }
    }, [] );

    // Check the session once when the app loads
    useEffect( () =>
    {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshUser().finally( () =>
        {
            if ( !cancelled ) setLoading( false );
        } );
        return () =>
        {
            cancelled = true;
        };
    }, [ refreshUser ] );

    const login: AuthContextValue[ "login" ] = useCallback(
        async ( data ) =>
        {
            const response = await api( "/auth/login", { method: "POST", body: data } );
            console.log( "login response", response );

            await refreshUser(); // read the user from the cookie session
        },
        [ refreshUser ]
    );

    const signup: AuthContextValue[ "signup" ] = useCallback( async ( data ) =>
    {
        // Don't log in yet: the user must verify their email first
        await api( "/auth/register", { method: "POST", body: data } );
    }, [] );

    const logout = useCallback( async () =>
    {
        try
        {
            await api( "/auth/logout", { method: "POST" } );
            sessionStorage.removeItem( 'profiledata' );
        } finally
        {
            setUser( null );
        }
    }, [] );

    const verifyUser: AuthContextValue[ "verifyUser" ] = useCallback(
        async ( data ) =>
        {
            await apiRequest.verifyUser( data );
            // If your backend logs the user in on verify, this loads them.
            // If not, /auth/me returns 401 and this safely stays null.
            await refreshUser();
        },
        [ refreshUser ]
    );

    const resendOtpCode: AuthContextValue[ "resendOtpCode" ] = useCallback( async ( data ) =>
    {
        await apiRequest.resendOtpCode( data );
    }, [] );

    const forgetPassword: AuthContextValue[ "forgetPassword" ] = useCallback( async ( data ) =>
    {
        await apiRequest.forgetPassword( data );
    }, [] );

    const resetPassword: AuthContextValue[ "resetPassword" ] = useCallback( async ( data ) =>
    {
        await apiRequest.resetPassword( data );
    }, [] );

    const setProfileData: AuthContextValue[ "setProfileData" ] = useCallback(
        async ( data ) =>
        {
            await apiRequest.setProfileData( data );
            sessionStorage.removeItem( 'profiledata' );
            await refreshUser(); // navbar and profile pick up the new name
        },
        [ refreshUser ]
    );

    const setProfileImage: AuthContextValue[ "setProfileImage" ] = useCallback(
        async ( file ) =>
        {
            const formData = new FormData();
            formData.append( "avatar", file ); // must match your FileInterceptor field name
            const response = await apiRequest.setProfileImage( formData );
            console.log( response );

            sessionStorage.removeItem( 'profiledata' );
            await refreshUser(); // navbar picks up the new photo
        },
        [ refreshUser ]
    );

    const deleteUserPermanently: AuthContextValue[ "deleteUserPermanently" ] = useCallback( async () =>
    {
        await apiRequest.deleteUserPermanently();
        sessionStorage.removeItem( 'profiledata' );
        setUser( null );
    }, [] );

    const value = useMemo<AuthContextValue>(
        () => ( {
            user,
            loading,
            isAdmin: user?.role === "admin",
            login,
            signup,
            logout,
            refreshUser,
            verifyUser,
            resendOtpCode,
            forgetPassword,
            resetPassword,
            setProfileData,
            setProfileImage,
            deleteUserPermanently,
        } ),
        [ user, loading, login, signup, logout, refreshUser, verifyUser, resendOtpCode, forgetPassword, resetPassword, setProfileData, setProfileImage, deleteUserPermanently ]
    );

    return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}