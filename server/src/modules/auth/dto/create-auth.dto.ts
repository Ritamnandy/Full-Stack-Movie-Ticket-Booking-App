import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";
export class CreateAuthDto
{
    @IsNotEmpty()
    @IsString()
    @MinLength( 3 )
    @MaxLength( 50 )
    @Transform( ( { value } ) => value.trim() )
    name: string;


    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Transform( ( { value } ) => value.trim() )
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    @Transform( ( { value } ) => value.trim() )
    password: string;

}
