
type JwtPaload = {
    id: string,
    email: string,
    role: string
}

type RefreshPayLoad = {
    id: string,
    email: string,
    role: string
}

type GetToken = {
    accessToken: string,
    refreshToken: string
}

export type { JwtPaload, RefreshPayLoad, GetToken }

