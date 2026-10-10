import axios from "axios";
import type { forgotPasswordData, resendOtpData, resetPasswordData, updateProfileData, verifyEmailData } from "../types/auth.types";
import { api } from "../config/api.config";


const getErrorMessage = ( error: unknown, fallback: string ) =>
{
    if ( axios.isAxiosError( error ) )
    {
        const msg = error.response?.data?.message;
        return ( Array.isArray( msg ) ? msg[ 0 ] : msg ) ?? fallback;
    }
    return fallback;
};






class ApiRequest
{


    async resendOtpCode ( userData: resendOtpData )
    {
        try
        {
            const data = await api( "/auth/resendotp", { method: "POST", body: userData } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to resend OTP, please try again later" ), { cause: error } );
        }
    }

    async verifyUser ( userData: verifyEmailData )
    {
        try
        {
            const data = await api( "/auth/verify", { method: "POST", body: userData } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to verify user, please try again later" ), { cause: error } );
        }
    }

    async forgetPassword ( userData: forgotPasswordData )
    {
        try
        {
            const data = await api( "/auth/forgotpassword", { method: "POST", body: userData } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to send reset link, please try again later" ), { cause: error } );
        }
    }

    async resetPassword ( userData: resetPasswordData )
    {
        try
        {
            const data = await api( "/auth/resetpassword", { method: "POST", body: userData } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to reset password, please try again later" ), { cause: error } );
        }
    }

    async setProfileData ( userData: updateProfileData )
    {
        try
        {
            const data = await api( "/auth/profile", { method: "PATCH", body: userData } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to update profile, please try again later" ), { cause: error } );
        }
    }

    async setProfileImage ( formData: FormData )
    {
        try
        {
            const data = await api( "/auth/avatar", { method: "PATCH", body: formData } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to update profile photo, please try again later" ), { cause: error } );
        }
    }

    async deleteUserPermanently ()
    {
        try
        {
            const data = await api( "/auth/delete", { method: "DELETE" } );
            return data;
        } catch ( error )
        {
            throw new Error( getErrorMessage( error, "Failed to delete account, please try again later" ), { cause: error } );
        }
    }
}

export const apiRequest = new ApiRequest();
