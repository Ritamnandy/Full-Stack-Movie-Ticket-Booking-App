
import mongoose, { type HydratedDocument, Model, Schema } from "mongoose";
import type { IUser, IUserMethods } from "../types/user.types";
import { UserRole } from "../constants";
import bcrypt from "bcrypt";





type UserDocument = HydratedDocument<IUser, IUserMethods>;

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel>( {
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
        default: null,
    },
    role: {
        type: String,
        enum: UserRole,
        default: UserRole.USER,
    },
}, { timestamps: true } );


userSchema.pre( "save", async function ()
{
    if ( !this.isModified( "password" ) || !this.password ) return;
    this.password = await bcrypt.hash( this.password, Number( process.env.SALT_NUMBER as string ) );
} );

userSchema.methods.comparePassword = async function ( password: string )
{
    return await bcrypt.compare( password, this.password );
}

const User = mongoose.model<IUser, UserModel>( "User", userSchema );

export
{
    User
}

export type {
    UserDocument
}


