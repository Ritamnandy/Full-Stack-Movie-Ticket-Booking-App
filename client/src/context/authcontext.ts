import { createContext } from "react";
import type { forgotPasswordData, resendOtpData, resetPasswordData, updateProfileData, verifyEmailData } from "../types/auth.types";

export type Role = "user" | "admin";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
    isVerified: boolean;
    avatar: string | null;
};

export type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean; // true until the first "who am I" check finishes
    isAdmin: boolean;
    login: ( data: { email: string; password: string } ) => Promise<void>;
    signup: ( data: { name: string; email: string; password: string } ) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<AuthUser | null>;
    verifyUser: ( data: verifyEmailData ) => Promise<void>;
    resendOtpCode: ( data: resendOtpData ) => Promise<void>;
    forgetPassword: ( data: forgotPasswordData ) => Promise<void>;
    resetPassword: ( data: resetPasswordData ) => Promise<void>;
    setProfileData: ( data: updateProfileData ) => Promise<void>;
    setProfileImage: ( file: File ) => Promise<void>;
    deleteUserPermanently: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>( null );