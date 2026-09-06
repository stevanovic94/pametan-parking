import {
  Component,
  inject,
} from '@angular/core';

import {
  Router,
} from '@angular/router';

import {
  IonButton,
} from '@ionic/angular';

import {
  finalize,
} from 'rxjs';

import {
  AuthService,
} from '../../../core/auth/auth.service';

import {
  AuthSessionService,
} from '../../../core/auth/auth-session.service';


@Component({
  selector: 'app-logout-button',

  templateUrl:
    './logout-button.component.html',

  imports: [
    IonButton,
  ],
})
export class LogoutButtonComponent {

  readonly authSession =
    inject(AuthSessionService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  isLoggingOut = false;


  logout(): void {

    if (this.isLoggingOut) {
      return;
    }


    this.isLoggingOut = true;


    this.authService
      .logout()
      .pipe(

        finalize(() => {

          /*
           * Lokalnu sesiju brišemo čak i ako
           * backend logout ne uspe, npr. zbog
           * isteka tokena ili problema sa mrežom.
           */
          this.authSession.clearSession();

          this.isLoggingOut = false;


          void this.router.navigateByUrl(
            '/login',
            {
              replaceUrl: true,
            },
          );
        }),
      )
      .subscribe({

        error: () => {
          /*
           * Namerno ne prikazujemo grešku.
           *
           * Korisnik je zatražio odjavu,
           * pa lokalnu sesiju svakako brišemo.
           */
        },

      });
  }
}