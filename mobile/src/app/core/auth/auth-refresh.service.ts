import {
    inject,
    Injectable,
} from '@angular/core';

import {
    catchError,
    finalize,
    map,
    Observable,
    shareReplay,
    throwError,
} from 'rxjs';

import {
    AuthService,
} from './auth.service';

import {
    AuthSessionService,
} from './auth-session.service';


@Injectable({
    providedIn: 'root',
})
export class AuthRefreshService {

    private readonly authService =
        inject(AuthService);

    private readonly authSession =
        inject(AuthSessionService);


    /*
     * Ako više HTTP zahteva istovremeno dobije 401,
     * ne želimo više paralelnih refresh zahteva.
     */
    private refreshRequest$:
        Observable<string> | null = null;


    refreshAccessToken():
        Observable<string> {

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


        /*
         * Refresh već traje.
         *
         * Ostali zahtevi čekaju isti Observable.
         */
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

                        /*
                         * Refresh endpoint sada vraća:
                         *
                         * accessToken
                         * refreshToken
                         * user
                         *
                         * Zato možemo obnoviti celu
                         * session state strukturu.
                         */
                        this.authSession.setSession(
                            response,
                        );


                        return response.accessToken;
                    }),


                    catchError((error) => {

                        /*
                         * Ako refresh nije uspeo,
                         * sesija više nije pouzdana.
                         */
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