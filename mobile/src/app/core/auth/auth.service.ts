import {
  HttpClient,
} from '@angular/common/http';

import {
  inject,
  Injectable,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../../environments/environment';

import {
  LoginRequest,
} from './models/login-request.model';

import {
  RegisterRequest,
} from './models/register-request.model';

import {
  RefreshRequest,
} from './models/refresh-request.model';

import {
  AuthResponse,
} from './models/auth-response.model';

import {
  RefreshResponse,
} from './models/refresh-response.model';

import {
  AuthUser,
} from './models/auth-user.model';


export interface CurrentUserResponse {
  sub: string;
  sid: string;
  jti: string;
  email: string;

  role:
  | 'USER'
  | 'OPERATOR'
  | 'ADMIN';

  type: 'access';

  iat?: number;
  exp?: number;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/auth`;


  login(
    request: LoginRequest,
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      request,
    );
  }


  register(
    request: RegisterRequest,
  ): Observable<AuthUser> {

    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      request,
    );
  }


  refresh(
    request: RefreshRequest,
  ): Observable<RefreshResponse> {

    return this.http.post<RefreshResponse>(
      `${this.apiUrl}/refresh`,
      request,
    );
  }


  logout(): Observable<{
    message: string;
  }> {

    return this.http.post<{
      message: string;
    }>(
      `${this.apiUrl}/logout`,
      {},
    );
  }


  getCurrentUser():
    Observable<CurrentUserResponse> {

    return this.http.get<CurrentUserResponse>(
      `${this.apiUrl}/me`,
    );
  }
}