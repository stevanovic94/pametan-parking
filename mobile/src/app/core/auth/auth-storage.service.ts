import {
    Injectable,
} from '@angular/core';

import {
    Capacitor,
} from '@capacitor/core';

import {
    SecureStorage,
} from '@aparajita/capacitor-secure-storage';


@Injectable({
    providedIn: 'root',
})
export class AuthStorageService {

    private readonly refreshTokenKey =
        'smart-parking-refresh-token';


    async saveRefreshToken(
        refreshToken: string,
    ): Promise<void> {

        /*
         * Native Android/iOS.
         */
        if (Capacitor.isNativePlatform()) {

            await SecureStorage.setItem(
                this.refreshTokenKey,
                refreshToken,
            );

            return;
        }


        /*
         * Browser development okruženje.
         *
         * Namerno koristimo sessionStorage,
         * a ne localStorage.
         */
        sessionStorage.setItem(
            this.refreshTokenKey,
            refreshToken,
        );
    }


    async getRefreshToken():
        Promise<string | null> {

        if (Capacitor.isNativePlatform()) {

            return SecureStorage.getItem(
                this.refreshTokenKey,
            );
        }


        return sessionStorage.getItem(
            this.refreshTokenKey,
        );
    }


    async clearRefreshToken():
        Promise<void> {

        if (Capacitor.isNativePlatform()) {

            await SecureStorage.removeItem(
                this.refreshTokenKey,
            );

            return;
        }


        sessionStorage.removeItem(
            this.refreshTokenKey,
        );
    }
}