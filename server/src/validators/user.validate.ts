
import { z } from "zod";

const userSchema = z.object( {
    name: z
        .string()
        .trim()
        .min( 5, { message: "Name must be at least 5 characters long" } )
        .max( 50, { message: "Name must be at most 50 characters long" } ),
    email: z
        .string()
        .email( { message: "Invalid email address" } )
        .trim(),
    password: z
        .string()
        .trim()
        .min( 6, { message: "Password must be at least 6 characters long" } )
        .max( 50, { message: "Password is too long" } )
        .regex( /[A-Z]/, { message: "Password must contain at least one uppercase letter" } )
        .regex( /[a-z]/, { message: "Password must contain at least one lowercase letter" } )
        .regex( /[0-9]/, { message: "Password must contain at least one digit" } )
        .regex( /[^A-Za-z0-9]/, { message: "Password must contain at least one special character" } )
        .optional(),
} );


type UserData = z.infer<typeof userSchema>;



export default userSchema;
export type { UserData };