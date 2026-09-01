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

  private readonly changeDetector =
    inject(ChangeDetectorRef);


  isSubmitting = false;

  serverError = '';

  loginSuccess = '';

  accessToken = '';

  refreshToken = '';


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


    console.log(
      'LOGIN: zahtev se šalje',
      loginRequest,
    );


    this.authService
      .login(loginRequest)
      .pipe(

        finalize(() => {

          this.isSubmitting = false;

          this.changeDetector.markForCheck();

        }),

      )
      .subscribe({

        next: (response) => {

          console.log(
            'LOGIN NEXT:',
            response,
          );


          this.accessToken =
            response.accessToken;

          this.refreshToken =
            response.refreshToken;


          this.loginSuccess =
            `Uspešna prijava: ${response.user.email}`;


          this.changeDetector.markForCheck();

        },


        error: (error: HttpErrorResponse) => {

          console.log(
            'LOGIN ERROR:',
            error,
          );


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