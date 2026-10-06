
type UserRoleType = "user" | "admin";

interface IUser
{
    name: string;
    email: string;
    password?: string;
    role: UserRoleType;
}

interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}

export type { IUser, UserRoleType, IUserMethods };