import {
    inject,
    Injectable,
} from '@angular/core';

import {
    firstValueFrom,
} from 'rxjs';

import {
    AuthService,
} from './auth.service';

import {
    AuthSessionService,
} from './auth-session.service';

import {
    AuthStorageService,
} from './auth-storage.service';


@Injectable({
    providedIn: 'root',
})
export class AuthBootstrapService {

    private readonly authService =
        inject(AuthService);

    private readonly authSession =
        inject(AuthSessionService);

    private readonly authStorage =
        inject(AuthStorageService);


    async initialize():
        Promise<void> {

        /*
         * Pri startovanju aplikacije u RAM-u
         * još nema access tokena ni korisnika.
         *
         * Iz storage-a čitamo samo refresh token.
         */
        let refreshToken: string | null;


        try {

            refreshToken =
                await this.authStorage
                    .getRefreshToken();

        } catch {

            /*
             * Ako storage nije dostupan,
             * nastavljamo kao neprijavljen korisnik.
             */
            return;
        }


        if (!refreshToken) {

            return;
        }


        try {

            /*
             * Backend proverava da li je stara
             * sesija i dalje validna.
             */
            const response =
                await firstValueFrom(
                    this.authService.refresh({
                        refreshToken,
                    }),
                );


            /*
             * response sada sadrži:
             *
             * novi access token
             * novi refresh token
             * svežeg korisnika iz baze
             */
            this.authSession.setSession(
                response,
            );


            /*
             * setSession() već pokreće čuvanje,
             * ali ovde čekamo upis novog rotiranog
             * refresh tokena pre završetka bootstrap-a.
             */
            await this.authStorage
                .saveRefreshToken(
                    response.refreshToken,
                );

        } catch {

            /*
             * Stari refresh token je:
             *
             * - istekao
             * - opozvan
             * - neispravan
             * - korisnik deaktiviran
             * itd.
             */
            this.authSession.clearSession();


            /*
             * Ovde eksplicitno čekamo brisanje
             * pre nastavka pokretanja aplikacije.
             */
            try {

                await this.authStorage
                    .clearRefreshToken();

            } catch {

                console.error(
                    'Brisanje nevažeće sesije nije uspelo.',
                );

            }
        }
    }
}