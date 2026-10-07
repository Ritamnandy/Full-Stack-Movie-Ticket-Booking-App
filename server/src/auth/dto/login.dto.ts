import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class LoginDto
{

    @IsNotEmpty()
    @Transform( ( { value } ) =>
        typeof value === "string" ? value.trim().toLowerCase() : value
    )
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Transform( ( { value } ) => value.trim() )
    @IsString()
    @IsStrongPassword()
    password: string;
}