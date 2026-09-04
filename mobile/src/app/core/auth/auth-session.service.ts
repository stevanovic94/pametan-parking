import {
    computed,
    Injectable,
    signal,
} from '@angular/core';

import {
    AuthResponse,
} from './models/auth-response.model';

import {
    AuthUser,
} from './models/auth-user.model';

import {
    AuthStorageService,
} from './auth-storage.service';


@Injectable({
    providedIn: 'root',
})
export class AuthSessionService {

    private readonly accessTokenSignal =
        signal<string | null>(null);

    private readonly refreshTokenSignal =
        signal<string | null>(null);

    private readonly userSignal =
        signal<AuthUser | null>(null);


    readonly accessToken =
        this.accessTokenSignal.asReadonly();

    readonly refreshToken =
        this.refreshTokenSignal.asReadonly();

    readonly user =
        this.userSignal.asReadonly();


    readonly isAuthenticated =
        computed(
            () =>
                this.accessTokenSignal() !== null &&
                this.userSignal() !== null,
        );


    constructor(
        private readonly authStorage:
            AuthStorageService,
    ) { }


    /*
     * Koristi se:
     *
     * - nakon login-a
     * - nakon refresh-a
     * - nakon bootstrap restore-a
     */
    setSession(
        response: AuthResponse,
    ): void {

        this.accessTokenSignal.set(
            response.accessToken,
        );

        this.refreshTokenSignal.set(
            response.refreshToken,
        );

        this.userSignal.set(
            response.user,
        );


        /*
         * Trajno čuvamo SAMO refresh token.
         */
        void this.authStorage
            .saveRefreshToken(
                response.refreshToken,
            )
            .catch(() => {

                console.error(
                    'Čuvanje sesije nije uspelo.',
                );

            });
    }


    /*
     * Ovaj metod zadržavamo jer može biti
     * koristan i kasnije.
     *
     * Menja samo tokene, korisnik ostaje isti.
     */
    updateTokens(
        accessToken: string,
        refreshToken: string,
    ): void {

        this.accessTokenSignal.set(
            accessToken,
        );

        this.refreshTokenSignal.set(
            refreshToken,
        );


        void this.authStorage
            .saveRefreshToken(
                refreshToken,
            )
            .catch(() => {

                console.error(
                    'Čuvanje osvežene sesije nije uspelo.',
                );

            });
    }


    /*
     * Briše RAM stanje i persistentni
     * refresh token.
     */
    clearSession(): void {

        this.accessTokenSignal.set(null);
        this.refreshTokenSignal.set(null);
        this.userSignal.set(null);


        void this.authStorage
            .clearRefreshToken()
            .catch(() => {

                console.error(
                    'Brisanje sačuvane sesije nije uspelo.',
                );

            });
    }
}