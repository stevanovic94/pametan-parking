import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { LoginRequest } from './models/login-request.model';
import { RegisterRequest } from './models/register-request.model';
import { AuthResponse } from './models/auth-response.model';
import { AuthUser } from './models/auth-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>( //server vraca podatke strukture AuthResponse
      `${this.apiUrl}/login`,
      request
    );
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      request
    );
  }
}