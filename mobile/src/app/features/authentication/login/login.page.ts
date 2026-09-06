import {
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class LoginPage {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly authSession =
    inject(AuthSessionService);

  private readonly changeDetector =
    inject(ChangeDetectorRef);

  private readonly router =
    inject(Router);

  isSubmitting = false;

  serverError = '';

  loginSuccess = '';


  readonly loginForm =
    this.formBuilder.nonNullable.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
        ],
      ],

    });


  onSubmit(): void {

    if (
      this.loginForm.invalid ||
      this.isSubmitting
    ) {
      this.loginForm.markAllAsTouched();
      return;
    }


    this.isSubmitting = true;

    this.serverError = '';

    this.loginSuccess = '';


    const loginRequest =
      this.loginForm.getRawValue();


    this.authService
      .login(loginRequest)
      .pipe(

        finalize(() => {

          /*
           * finalize se izvršava i kada je HTTP zahtev uspešan
           * i kada se završi greškom.
           *
           * Zato isSubmitting vraćamo na false samo ovde,
           * a ne posebno u next i error.
           */
          this.isSubmitting = false;

          /*
           * Angular treba obavestiti da su se promenile
           * obične promenljive koje koristi template.
           */
          this.changeDetector.markForCheck();

        }),

      )
      .subscribe({

        /*
         * Uspešna prijava.
         */
        next: (response) => {

          /*
           * AuthSessionService preuzima odgovornost
           * za čuvanje access tokena, refresh tokena
           * i podataka prijavljenog korisnika.
           */

          this.authSession.setSession(
            response
          );

          void this.router.navigateByUrl(
            '/home'
          );

          console.log(
            'Korisnik je uspešno prijavljen:',
            response.user.email
          );

          this.loginSuccess =
            `Uspešna prijava: ${response.user.email}`;

          this.changeDetector.markForCheck();

        },

        error: (error: HttpErrorResponse) => {

          if (error.status === 401) {

            this.serverError =
              'Email ili lozinka nisu ispravni.';

          } else if (error.status === 403) {

            this.serverError =
              'Korisnički nalog je deaktiviran.';

          } else {

            this.serverError =
              'Došlo je do greške. Pokušajte ponovo.';

          }


          this.changeDetector.markForCheck();

        },

      });
  }
}