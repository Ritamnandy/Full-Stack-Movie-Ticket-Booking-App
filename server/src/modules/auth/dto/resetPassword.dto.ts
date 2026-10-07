

import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {
    
    @IsNotEmpty()
    @Transform( ( { value } ) => value.trim() )
    @IsString()
    @IsStrongPassword()
    password: string

    @IsNotEmpty()
    @Transform( ( { value } ) => value.trim() )
    @IsString()
    token: string
}