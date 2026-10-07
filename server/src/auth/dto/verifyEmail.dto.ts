import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class VerifyEmailDto
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
    @MinLength( 6 )
    @MaxLength( 6 )
    otp: string
}