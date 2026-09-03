import { UserRole } from "../types/user-role.type";

export interface AuthMeResponse {
    sub: string;
    email: string;
    role: UserRole;
    sid: string;
    jti: string;
    type: 'access';
    iat: number;
    exp: number;
}