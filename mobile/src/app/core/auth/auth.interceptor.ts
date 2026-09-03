import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpInterceptorFn,
} from '@angular/common/http';

import {
  catchError,
  finalize,
  map,
  Observable,
  shareReplay,
  throwError,
} from 'rxjs';

import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';


export const authInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {

  const authSession =
    inject(AuthSessionService);

  const accessToken =
    authSession.accessToken();

  if (!accessToken) {
    return next(request);
  }

  const authenticatedRequest =
    request.clone({
      setHeaders: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    });

  return next(authenticatedRequest);
};


@Injectable({
  providedIn: 'root',
})
export class AuthRefreshService {

  private readonly authService =
    inject(AuthService);

  private readonly authSession =
    inject(AuthSessionService);

  private refreshRequest$:
    Observable<string> | null = null;


  refreshAccessToken(): Observable<string> {

    const refreshToken =
      this.authSession.refreshToken();

    if (!refreshToken) {

      this.authSession.clearSession();

      return throwError(
        () =>
          new Error(
            'Refresh token ne postoji.',
          ),
      );
    }


    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }


    this.refreshRequest$ =
      this.authService
        .refresh({
          refreshToken,
        })
        .pipe(

          map((response) => {

            this.authSession.updateTokens(
              response.accessToken,
              response.refreshToken,
            );

            return response.accessToken;
          }),

          catchError((error) => {

            this.authSession.clearSession();

            return throwError(
              () => error,
            );
          }),

          finalize(() => {
            this.refreshRequest$ = null;
          }),

          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),

        );


    return this.refreshRequest$;
  }
}