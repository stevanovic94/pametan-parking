import { UserRole } from "../types/user-role.type.js";

export interface JwtPayload {
  sub: string;                      //standardni JWT claim za identitet subjekta
  email: string;
  role: UserRole;
  type: 'access';
}