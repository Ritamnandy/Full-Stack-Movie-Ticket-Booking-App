import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto
{
    @IsNotEmpty()
    @Transform( ( { value } ) =>
        typeof value === "string" ? value.trim().toLowerCase() : value
        )
        @IsString()
    refreshToken: string;
}