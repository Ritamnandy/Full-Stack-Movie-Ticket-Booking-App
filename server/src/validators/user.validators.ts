

import z from "zod";

const registerSchema = z.object( {

    name: z
        .string()
        .trim()
        .min( 3, { message: "name must be at least 3 characters long" } )
        .max( 50, { message: "name must be at most 50 characters long" } ),
    email: z
        .string()
        .trim()
        .email( { message: "Invalid email address" } )
        .max( 100, { message: "Email must be at most 100 characters long" } ),
    password: z
        .string()
        .trim()
        .min( 6, { message: "Password must be at least 6 characters long" } )
        .max( 50, { message: "Password must be at most 50 characters long" } )
        .regex( /[A-Z]/, { message: "Password must contain at least one uppercase letter" } )
        .regex( /[a-z]/, { message: "Password must contain at least one lowercase letter" } )
        .regex( /[0-9]/, { message: "Password must contain at least one digit" } )
        .regex( /[^A-Za-z0-9]/, { message: "Password must contain at least one special character" } ),

} )

const loginSchema = z.object( {
    email: z
        .string()
        .trim()
        .email( { message: "Invalid email address" } )
        .max( 100, { message: "Email must be at most 100 characters long" } ),
    password: z
        .string()
        .trim()
        .min( 6, { message: "Password must be at least 6 characters long" } )
        .max( 50, { message: "Password must be at most 50 characters long" } )
        .regex( /[A-Z]/, { message: "Password must contain at least one uppercase letter" } )
        .regex( /[a-z]/, { message: "Password must contain at least one lowercase letter" } )
        .regex( /[0-9]/, { message: "Password must contain at least one digit" } )
        .regex( /[^A-Za-z0-9]/, { message: "Password must contain at least one special character" } ),
} )

const verificationSchema = z.object( {
    email: z
        .string()
        .trim()
        .email( { message: "Invalid email address" } )
        .max( 100, { message: "Email must be at most 100 characters long" } ),
    otp: z
        .string()
        .trim()
        .max( 6, { message: "Otp must be at most 6 characters long" } ),
} )


const forgetPasswordSchema = z.object( {
    email: z
        .string()
        .trim()
        .email( { message: "Invalid email address" } )
        .max( 100, { message: "Email must be at most 100 characters long" } ),
} )


const resetpasswordSchema = z.object( {
    token: z
        .string()
        .trim()
        .max( 6, { message: "Token must be at most 6 characters long" } ),
    password: z
        .string()
        .trim()
        .min( 6, { message: "Password must be at least 6 characters long" } )
        .max( 50, { message: "Password must be at most 50 characters long" } )
        .regex( /[A-Z]/, { message: "Password must contain at least one uppercase letter" } )
        .regex( /[a-z]/, { message: "Password must contain at least one lowercase letter" } )
        .regex( /[0-9]/, { message: "Password must contain at least one digit" } )
        .regex( /[^A-Za-z0-9]/, { message: "Password must contain at least one special character" } ),
} )


const resendCodeSchema = z.object( {
    email: z
        .string()
        .trim()
        .email( { message: "Invalid email address" } )
        .max( 100, { message: "Email must be at most 100 characters long" } ),
} )

// All fields optional
const updateProfileSchema = registerSchema
    .pick( { name: true } )          // only fields editable here
    .partial()
    .strict()                      // reject unknown keys like role, isVerified
    .refine(
        ( data ) => Object.keys( data ).length > 0,
        { message: "At least one field is required to update" }
    )

type RegisterInput = z.infer<typeof registerSchema>
type LoginInput = z.infer<typeof loginSchema>
type VerificationInput = z.infer<typeof verificationSchema>
type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>
type ResetPasswordInput = z.infer<typeof resetpasswordSchema>
type ResendCodeInput = z.infer<typeof resendCodeSchema>


export const valivationScheme = {
    register: registerSchema,
    login: loginSchema,
    verification: verificationSchema,
    forgetPassword: forgetPasswordSchema,
    resetPassword: resetpasswordSchema,
    resendCode: resendCodeSchema,
    updateProfile: updateProfileSchema,
}

export type { RegisterInput, LoginInput, VerificationInput, ForgetPasswordInput, ResetPasswordInput, ResendCodeInput }

