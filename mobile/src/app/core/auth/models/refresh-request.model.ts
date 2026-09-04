import { AuthUser } from './auth-user.model';

// export interface RefreshResponse {
//   accessToken: string;
//   refreshToken: string;
//   user: AuthUser;
// }

export interface RefreshRequest {
  refreshToken: string;
}