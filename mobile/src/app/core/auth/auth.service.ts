import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { LoginRequest } from './models/login-request.model';
import { RegisterRequest } from './models/register-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/login`,
      request
    );
  }

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/register`,
      request
    );
  }
}