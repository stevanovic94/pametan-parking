export interface AuthMeResponse {
    sub: string;
    email: string;
    role: 'USER' | 'OPERATOR' | 'ADMIN';
    sid: string;
    jti: string;
    type: 'access';
    iat: number;
    exp: number;
}