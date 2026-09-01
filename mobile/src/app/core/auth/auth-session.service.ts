import {
    computed,
    Injectable,
    signal
} from '@angular/core';

import { AuthResponse } from './models/auth-response.model';
import { AuthUser } from './models/auth-user.model';

@Injectable({
    providedIn: 'root'
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

    readonly isAuthenticated = computed(
        () =>
            this.accessTokenSignal() !== null &&
            this.userSignal() !== null
    );

    setSession(
        response: AuthResponse
    ): void {

        this.accessTokenSignal.set(
            response.accessToken
        );

        this.refreshTokenSignal.set(
            response.refreshToken
        );

        this.userSignal.set(
            response.user
        );
    }

    updateTokens(
        accessToken: string,
        refreshToken: string
    ): void {

        this.accessTokenSignal.set(
            accessToken
        );

        this.refreshTokenSignal.set(
            refreshToken
        );
    }

    clearSession(): void {

        this.accessTokenSignal.set(null);
        this.refreshTokenSignal.set(null);
        this.userSignal.set(null);
    }
}