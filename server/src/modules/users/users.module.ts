import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schemas.js'
import { UsersRepository } from './users.repository.js'

@Module( {
    imports: [ MongooseModule.forFeature( [ { name: User.name, schema: UserSchema } ] ) ],
    providers: [ UsersRepository ],
    exports: [ UsersRepository ], // so AuthModule can use it
} )
export class UsersModule { }