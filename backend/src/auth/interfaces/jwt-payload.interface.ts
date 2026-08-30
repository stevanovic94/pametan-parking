export interface JwtPayload {
  sub: string;                      //standardni JWT claim za identitet subjekta
  email: string;
  role: string;
}