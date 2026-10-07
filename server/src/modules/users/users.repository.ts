import
{
    ConflictException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    BadRequestException,
    Logger,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Error as MongooseError, isValidObjectId, Model, UpdateQuery } from 'mongoose'

import { CreateAuthDto } from '../auth/dto/create-auth.dto.js'
import { UpdateAuthDto } from '../auth/dto/update-auth.dto.js'
import type { GoogleOauthBody } from '../auth/types/googleauthbody.types.js'
import { User, type UserDocument } from './schemas/user.schemas.js'
import { UserRole, UserStatus } from '../../common/enum/enum.js'

@Injectable()
export class UsersRepository
{
    private readonly logger = new Logger( UsersRepository.name )

    constructor ( @InjectModel( User.name ) private readonly userModel: Model<UserDocument> )
    {
        this.logger.log( 'UsersRepository initialized' )
    }

    private handleError ( error: unknown, context: string ): never
    {
        // Our own NotFound / Conflict exceptions pass straight through
        if ( error instanceof HttpException ) throw error

        if ( ( error as { code?: number } )?.code === 11000 )
        {
            const fields = Object.keys( ( error as { keyPattern?: object } ).keyPattern ?? {} )
            this.logger.warn( `[${ context }] Unique constraint violation: ${ JSON.stringify( fields ) }` )
            throw new ConflictException( 'A record with these details already exists' )
        }

        if ( error instanceof MongooseError.ValidationError )
        {
            this.logger.error( `[${ context }] Validation error: ${ error.message }` )
            throw new BadRequestException( 'Invalid data provided to database operation' )
        }

        if ( error instanceof MongooseError.CastError )
        {
            this.logger.warn( `[${ context }] Cast error on ${ error.path }` )
            throw new BadRequestException( 'Invalid identifier provided' )
        }

        this.logger.error( `[${ context }] Unexpected error: ${ ( error as Error )?.message }`, ( error as Error )?.stack )
        throw new InternalServerErrorException( 'Something went wrong, please try again later' )
    }

    /** Shared helper: update one user by id, throw 404 if missing, return the new document */
    private async updateById ( id: string, update: UpdateQuery<UserDocument>, context: string )
    {
        try
        {
            if ( !isValidObjectId( id ) ) throw new NotFoundException( 'User not found' )

            const user = await this.userModel
                .findByIdAndUpdate( id, update, { new: true, runValidators: true } )
                .exec()

            if ( !user ) throw new NotFoundException( 'User not found' )
            return user
        } catch ( error )
        {
            this.handleError( error, context )
        }
    }

    async createUser ( data: CreateAuthDto )
    {
        try
        {
            return await this.userModel.create( {
                name: data.name,
                email: data.email,
                password: data.password,
                role: UserRole.USER,
                isVerified: true,
                status: UserStatus.ACTIVE,
            } )
        } catch ( error )
        {
            this.handleError( error, 'createUser' )
        }
    }

    async findUserByEmail ( email: string )
    {
        try
        {
            return await this.userModel
                .findOne( { email: email.trim().toLowerCase() } )
                .exec()
        } catch ( error )
        {
            this.handleError( error, 'findUserByEmail' )
        }
    }

    async findUserById ( id: string )
    {
        try
        {
            if ( !isValidObjectId( id ) ) return null // same as Prisma "not found" => null

            return await this.userModel
                .findById( id )
                .exec()
        } catch ( error )
        {
            this.handleError( error, 'findUserById' )
        }
    }

    async findUserByGoogleId ( googleId: string )
    {
        try
        {
            return await this.userModel.findOne( { googleId } ).exec()
        } catch ( error )
        {
            this.handleError( error, 'findUserByGoogleId' )
        }
    }

    updateUser ( id: string, data: UpdateAuthDto )
    {
        try
        {
            return this.updateById( id, { $set: data }, 'updateUser' )
        } catch ( error )
        {
            this.handleError( error, 'updateUser' )
        }
    }

    logoutUser ( id: string )
    {
        return this.updateById(
            id,
            { $set: { status: UserStatus.INACTIVE }, $unset: { refreshToken: '' } },
            'logoutUser',
        )
    }

    async loginWithGoogle ( data: GoogleOauthBody )
    {
        try
        {
            return await this.userModel.create( {
                googleId: data.googleId,
                email: data.email,
                name: data.name,
                profileImage: data.profileImage,
                isVerified: data.isEmailVerified,
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
            } )
        } catch ( error )
        {
            this.handleError( error, 'loginWithGoogle' )
        }
    }

    setRefreshToken ( id: string, refreshToken: string )
    {
        return this.updateById( id, { $set: { refreshToken } }, 'setRefreshToken' )
    }

    setProfileImage ( id: string, profileImage: string )
    {
        return this.updateById( id, { $set: { profileImage } }, 'setProfileImage' )
    }

    updateUserPassword ( id: string, password: string )
    {
        return this.updateById( id, { $set: { password } }, 'updateUserPassword' )
    }

    linkGoogleAccount ( userId: string, googleId: string )
    {
        return this.updateById( userId, { $set: { googleId } }, 'linkGoogleAccount' )
    }

    async deleteUser ( id: string )
    {
        try
        {
            if ( !isValidObjectId( id ) ) throw new NotFoundException( 'User not found' )

            const user = await this.userModel.findByIdAndDelete( id ).exec()
            if ( !user ) throw new NotFoundException( 'User not found' )
            return user
        } catch ( error )
        {
            this.handleError( error, 'deleteUser' )
        }
    }
}