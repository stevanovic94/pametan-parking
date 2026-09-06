import {
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import { AuthSessionService } from '../core/auth/auth-session.service';
import { AuthService } from '../core/auth/auth.service';
import { RouterLink } from '@angular/router';
import { LogoutButtonComponent } from '../shared/components/logout-button/logout-button.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],

  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    LogoutButtonComponent,
    RouterLink,
  ],
})
export class HomePage {

  readonly authSession =
    inject(AuthSessionService);

  private readonly authService =
    inject(AuthService);

  private readonly changeDetector =
    inject(ChangeDetectorRef);


  sessionTestResult = '';


  testProtectedEndpoint(): void {

    this.sessionTestResult =
      'Provera...';


    this.authService
      .getCurrentUser()
      .subscribe({

        next: (response) => {

          console.log(
            'SESSION TEST NEXT:',
            response,
          );


          this.sessionTestResult =
            `Sesija je validna: ${response.email}`;


          this.changeDetector.markForCheck();
        },


        error: (error: HttpErrorResponse) => {

          console.log(
            'SESSION TEST ERROR:',
            error,
          );


          if (error.status === 401) {

            this.sessionTestResult =
              'Sesija nije validna ili je istekla.';

          } else {

            this.sessionTestResult =
              'Greška pri proveri sesije.';

          }


          this.changeDetector.markForCheck();
        },

      });
  }
}