
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { CreateAuthDto } from "../dto/create-auth.dto.js";
import { UpdateAuthDto } from "../dto/update-auth.dto.js";
import type { GoogleOauthBody } from "../types/googleauthbody.types.js";

@Injectable()
export class AuthRepository
{
    private readonly logger = new Logger( AuthRepository.name );
    private handleError ( error: unknown, context: string, notFoundMsg: string = "Resource not found" ): never
    {
        if ( error instanceof PrismaClientKnownRequestError )
        {
            switch ( error.code )
            {
                case 'p2002':
                    this.logger.warn( `[${ context }] Unique constraint violation: ${ JSON.stringify( error.meta?.target ) }`, )
                    throw new ConflictException(
                        'A record with these details already exists',
                    );
                case 'p2025':
                    this.logger.warn( `[${ context }] Record not found` );
                    throw new NotFoundException( notFoundMsg );

                default:
                    this.logger.error(
                        `[${ context }] Prisma error ${ error.code }: ${ error.message }`,
                    );
                    throw new InternalServerErrorException( 'Database operation failed' );
            }
        }
        if ( error instanceof PrismaClientValidationError )
        {
            this.logger.error(
                `[${ context }] Prisma validation error: ${ error.message }`,
            );
            throw new BadRequestException(
                'Invalid data provided to database operation',
            );
        }
        this.logger.error(
            `[${ context }] Unexpected error: ${ ( error as Error )?.message }`,
            ( error as Error )?.stack,
        );
        throw new InternalServerErrorException(
            'Something went wrong, please try again later',
        );
    }
    constructor ( private readonly prisma: PrismaService )
    {
        this.logger.log( 'AuthRepository initialized' );
    }

    async createUser ( data: CreateAuthDto )
    {
        try
        {

            return this.prisma.user.create( {
                data: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: 'USER',
                    isVerified: true,
                    status: 'ACTIVE'
                }
            } )


        } catch ( error )
        {
            this.handleError( error, 'createUser' );
        }
    }

    async findUserByEmail ( email: string )
    {
        try
        {

            return this.prisma.user.findUnique( {
                where: {
                    email
                }
            } )


        } catch ( error )
        {
            this.handleError( error, 'findUserByEmail' );
        }
    }

    async findUserById ( id: string )
    {
        try
        {

            return this.prisma.user.findUnique( {
                where: {
                    id
                }
            } )


        } catch ( error )
        {
            this.handleError( error, 'findUserById' );
        }
    }

    async updateUser ( id: string, data: UpdateAuthDto )
    {
        try
        {

            return this.prisma.user.update( {
                where: {
                    id
                },
                data
            } )


        } catch ( error )
        {
            this.handleError( error, 'updateUser' );
        }
    }

    async logoutUser ( id: string )
    {
        try
        {

            return this.prisma.user.update( {
                where: {
                    id
                },
                data: {
                    status: 'INACTIVE',
                    refreshToken: null
                }
            } )


        } catch ( error )
        {
            this.handleError( error, 'logoutUser' );
        }
    }

    async loginWithGoogle ( data: GoogleOauthBody )
    {
        try
        {
            return await this.prisma.user.create( {
                data: {
                    googleId: data.googleId,
                    email: data.email,
                    name: data.name,
                    profileImage: data.profileImage,
                    isVerified: data.isEmailVerified,
                    role: 'USER',
                    status: 'ACTIVE'
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'loginWithGoogle' );
        }
    }

    async findUserByGoogleId ( googleId: string )
    {
        try
        {
            return this.prisma.user.findUnique( {
                where: {
                    googleId
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'findUserByGoogleId' );
        }
    }

    async setRefreshToken ( id: string, refreshToken: string )
    {
        try
        {
            return this.prisma.user.update( {
                where: {
                    id
                },
                data: {
                    refreshToken: refreshToken
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'setRefreshToken' );
        }
    }

    async setProfileImage ( id: string, profileImage: string )
    {
        try
        {
            return this.prisma.user.update( {
                where: {
                    id
                },
                data: {
                    profileImage
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'setProfileImage' );
        }
    }

    async deleteUser ( id: string )
    {
        try
        {
            return this.prisma.user.delete( {
                where: {
                    id
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'deleteUser' );
        }
    }

    async updateUserPassword ( id: string, password: string )
    {
        try
        {
            return this.prisma.user.update( {
                where: {
                    id
                },
                data: {
                    password
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'updateUserPassword' );
        }
    }

    async linkGoogleAccount ( userId: string, googleId: string )
    {
        try
        {
            return this.prisma.user.update( {
                where: {
                    id: userId
                },
                data: {
                    googleId: googleId
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'linkGoogleAccount' );
        }
    }

}
