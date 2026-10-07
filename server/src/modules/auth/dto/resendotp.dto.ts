
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResendOtpDto
{
    @IsNotEmpty()
    @Transform( ( { value } ) =>
        typeof value === "string" ? value.trim().toLowerCase() : value
    )
    @IsString()
    @IsEmail()
    email: string;
}