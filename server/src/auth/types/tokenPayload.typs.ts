
type JwtAccessTokenPaload = {
    id: string,
    email: string,
    role: string
}

type JwtRefreshTokenPaload = {
    id: string,
    email: string,
    role: string,
}

export type { JwtAccessTokenPaload, JwtRefreshTokenPaload };