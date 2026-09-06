import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, ReactiveFormsModule, RouterLink, CommonModule]
})

export class RegisterPage {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  isSubmitting = false;
  serverError = '';
  registrationSuccessful = false;

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators: [passwordsMatchValidator]
    }
  );

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.serverError = '';
    this.registrationSuccessful = false;

    const formValue = this.registerForm.getRawValue();

    //this.authService.register({}).subscribe({});
    this.authService.register({
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password
    }).subscribe({ // vraca Observable<AuthUser>
      //next: () => {}, error: () => {} 

      // 1) uspesan odgovor servera
      next: () => {
        this.isSubmitting = false;
        this.registrationSuccessful = true;

        this.registerForm.reset();
      },

      // 2) HTTP zahtev zavrsen greskom
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;

        if (error.status === 409) {
          this.serverError = 'Korisnik sa ovom email adresom već postoji.';
          return;
        }

        if (error.status === 400) {
          this.serverError =
            'Podaci za registraciju nisu ispravni.';
          return;
        }

        this.serverError = 'Došlo je do greške. Pokušajte ponovo.';
      }
    });

  }
}
