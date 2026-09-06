import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';

import {
  inject,
} from '@angular/core';

import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';

import {
  environment,
} from '../../../environments/environment';

import {
  AuthSessionService,
} from './auth-session.service';

import {
  AuthRefreshService,
} from './auth-refresh.service';


export const authInterceptor:
  HttpInterceptorFn =
  (
    request,
    next,
  ) => {

    /*
     * JWT sme da se šalje samo našem API-ju.
     */
    const isBackendRequest =
      request.url.startsWith(
        environment.apiUrl,
      );


    /*
     * Zahteve prema drugim serverima
     * interceptor uopšte ne dira.
     */
    if (!isBackendRequest) {
      return next(request);
    }


    const authSession =
      inject(AuthSessionService);

    const authRefresh =
      inject(AuthRefreshService);


    const authBaseUrl =
      `${environment.apiUrl}/auth`;


    const isLoginRequest =
      request.url ===
      `${authBaseUrl}/login`;

    const isRegisterRequest =
      request.url ===
      `${authBaseUrl}/register`;

    const isRefreshRequest =
      request.url ===
      `${authBaseUrl}/refresh`;

    const isLogoutRequest =
      request.url ===
      `${authBaseUrl}/logout`;


    /*
     * Login, register i refresh ne koriste
     * access token.
     *
     * Logout ga koristi.
     */
    const shouldSkipAccessToken =
      isLoginRequest ||
      isRegisterRequest ||
      isRefreshRequest;


    const accessToken =
      authSession.accessToken();


    let requestToSend =
      request;


    if (
      !shouldSkipAccessToken &&
      accessToken
    ) {

      requestToSend =
        addAccessToken(
          request,
          accessToken,
        );
    }


    return next(
      requestToSend,
    ).pipe(

      catchError(
        (
          error:
            HttpErrorResponse,
        ) => {

          /*
           * Refresh pokušavamo samo za
           * regularan zaštićeni API zahtev.
           */
          const shouldTryRefresh =
            error.status === 401 &&
            !isLoginRequest &&
            !isRegisterRequest &&
            !isRefreshRequest &&
            !isLogoutRequest &&
            authSession.refreshToken() !== null;


          if (!shouldTryRefresh) {

            return throwError(
              () => error,
            );
          }


          return authRefresh
            .refreshAccessToken()
            .pipe(

              switchMap(
                (
                  newAccessToken,
                ) => {

                  const retryRequest =
                    addAccessToken(
                      request,
                      newAccessToken,
                    );


                  return next(
                    retryRequest,
                  );
                },
              ),
            );
        },
      ),
    );
  };


function addAccessToken(
  request: HttpRequest<unknown>,
  accessToken: string,
): HttpRequest<unknown> {

  return request.clone({
    setHeaders: {
      Authorization:
        `Bearer ${accessToken}`,
    },
  });
}