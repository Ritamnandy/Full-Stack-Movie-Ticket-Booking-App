
import { User, type UserDocument } from "../models/user.models";
import type { UserData } from "../validators/user.validate";


class UserRepository
{

    async createUser ( userData: UserData )
    {
        return await User.create( {
            email: userData.email,
            name: userData.name,
            password: userData.password,
        } )

    }

    async updateUser ( userId: string, userData: Partial<UserData> )
    {
        return await User.findByIdAndUpdate( userId, userData, { new: true } )
    }

    async deleteUser ( userId: string )
    {
        return await User.findByIdAndDelete( userId )
    }
}

export const userRepository = new UserRepository();