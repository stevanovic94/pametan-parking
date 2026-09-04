import {
  HttpErrorResponse,
  HttpInterceptorFn,
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

    const authSession =
      inject(AuthSessionService);


    /*
     * Auth endpointi nad kojima NE želimo
     * automatski refresh.
     *
     * Posebno je bitan /auth/refresh,
     * jer bi u suprotnom nastala refresh petlja.
     */
    const isLoginRequest =
      request.url.includes(
        '/auth/login',
      );

    const isRegisterRequest =
      request.url.includes(
        '/auth/register',
      );

    const isRefreshRequest =
      request.url.includes(
        '/auth/refresh',
      );


    if (
      isLoginRequest ||
      isRegisterRequest ||
      isRefreshRequest
    ) {

      return next(request);
    }


    /*
     * Tek za zahteve kojima treba autentifikacija
     * koristimo AuthRefreshService.
     */
    const authRefresh =
      inject(AuthRefreshService);


    const accessToken =
      authSession.accessToken();


    const requestToSend =
      accessToken
        ? request.clone({
          setHeaders: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        })
        : request;


    return next(
      requestToSend,
    ).pipe(

      catchError(
        (
          error:
            HttpErrorResponse,
        ) => {

          /*
           * Ako greška nije 401,
           * interceptor je samo prosleđuje.
           */
          if (
            error.status !== 401
          ) {

            return throwError(
              () => error,
            );
          }


          /*
           * Bez refresh tokena nema
           * mogućnosti obnove sesije.
           */
          if (
            !authSession.refreshToken()
          ) {

            return throwError(
              () => error,
            );
          }


          /*
           * Pokušavamo refresh.
           */
          return authRefresh
            .refreshAccessToken()
            .pipe(

              switchMap(
                (
                  newAccessToken,
                ) => {

                  /*
                   * Ponovimo originalni HTTP zahtev,
                   * ali sa novim access tokenom.
                   */
                  const retryRequest =
                    request.clone({
                      setHeaders: {
                        Authorization:
                          `Bearer ${newAccessToken}`,
                      },
                    });


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