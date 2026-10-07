
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { UserRole, UserStatus } from '../../../common/enum/enum.js'


export type UserDocument = HydratedDocument<User>

@Schema( { timestamps: true } )
export class User
{
    @Prop( { required: true, unique: true, lowercase: true, trim: true } )
    email: string

    @Prop( { required: true, trim: true } )
    name: string

    // select:false => never returned unless you ask with .select('+password')
    @Prop( { type: String } )
    password?: string

    @Prop( { required: true, default: false } )
    isVerified: boolean

    @Prop( { type: String, enum: UserRole, default: UserRole.USER } )
    role: UserRole

    // sparse: many users may have no googleId, but when set it must be unique
    @Prop( { type: String, unique: true, sparse: true } )
    googleId?: string


    @Prop( { type: String } )
    profileImage?: string

    @Prop( { type: String, enum: UserStatus, default: UserStatus.ACTIVE } )
    status: UserStatus

    // stores the SHA-256 hash of the refresh token
    @Prop( { type: String, select: false } )
    refreshToken?: string | null
}

export const UserSchema = SchemaFactory.createForClass( User )