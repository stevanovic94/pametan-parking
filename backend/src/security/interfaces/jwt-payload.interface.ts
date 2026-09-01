import { UserRole } from "../types/user-role.type.js";

export interface JwtPayload {
  sub: string;            //subject - standardni JWT claim za identitet subjekta
  email: string;
  role: UserRole;

  sid: string;            //sessionid - za gasenje login sesije
  jti: string;            //jwt id - za stavljanje access tokena na blacklist

  type: 'access';

  iat?: number;
  exp?: number;
}