
import mongoose, { Types, type HydratedDocument, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions, type Secret, type JwtPayload } from "jsonwebtoken";
import type { Iuser, IuserMethods } from "../types/models.types";
import { LoginType, UserRoles, UserStatus } from "../constants";
import type { JwtPaload, RefreshPayLoad } from "../types/paload.types";

type UserDocument = HydratedDocument<Iuser, IuserMethods>

type UserModel = Model<Iuser, {}, IuserMethods>

const userSchema = new Schema<Iuser, UserModel, IuserMethods>( {


    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
        required: function ()
        {
            return this.loginType === LoginType.EMAIL
        }
    },
    role: {
        type: String,
        required: true,
        enum: UserRoles,
        default: UserRoles.USER
    },
    status: {
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    },
    loginType: {
        type: String,
        required: true,
        enum: LoginType,
        default: LoginType.EMAIL
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    googleId: {
        type: String,
        trim: true,
        required: function ()
        {
            return this.loginType === LoginType.GOOGLE
        },
        default: null
    },
    profileImage: {
        type: String,
        trim: true,
        default: null
    },
    refreshToken: {
        type: String,
        trim: true,
        default: null
    },


}, { timestamps: true } )



userSchema.pre( "save", async function ()
{
    if ( !this.isModified( "password" ) || !this.password ) return

    this.password = await bcrypt.hash( this.password, Number( process.env.BCRYPT_SALT_ROUNDS as string ) )

} )


userSchema.methods.comparePassword = async function ( password: string ): Promise<boolean>
{
    if ( !this.password ) return false;
    return await bcrypt.compare( password, this.password )
}

const jwtSecret = process.env.JWT_SECRET as string
const jwtExpiresIn = process.env.JWT_EXPIRES_IN as string

if ( !jwtSecret )
{
    throw new Error( "JWT_TOKEN_SECRET is not defined" )
}

if ( !jwtExpiresIn )
{
    throw new Error( "JWT_TOKEN_EXPIRES_IN is not defined" )
}
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN as string
if ( !refreshTokenSecret )
{
    throw new Error( "REFRESH_TOKEN_SECRET is not defined" )
}
if ( !refreshTokenExpiresIn )
{
    throw new Error( "REFRESH_TOKEN_EXPIRES_IN is not defined" )
}


userSchema.methods.generateAccessToken = function (): string
{
    const payload: JwtPaload = {
        id: this._id.toString(),
        role: this.role,
        email: this.email
    }
    return jwt.sign( payload as JwtPayload, jwtSecret as Secret, { expiresIn: jwtExpiresIn } as SignOptions )
}


userSchema.methods.generateRefreshToken = function (): string
{
    const payload: RefreshPayLoad = {
        id: this._id.toString(),
        role: this.role,
        email: this.email
    }
    return jwt.sign( payload as JwtPayload, refreshTokenSecret as Secret, { expiresIn: refreshTokenExpiresIn } as SignOptions )
}

export const User = mongoose.model<Iuser, UserModel>( "User", userSchema )


export type {
    UserDocument
}