import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { finalize } from 'rxjs';
import { ParkingSpace } from '../../../core/parking/models/parking-space.model';
import { ParkingService } from '../../../core/parking/parking.service';
import { ReservationService } from '../../../core/reservations/reservation.service';

@Component({
  selector: 'app-create-reservation',
  templateUrl: './create-reservation.page.html',
  styleUrls: ['./create-reservation.page.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
  ],
})
export class CreateReservationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingService = inject(ParkingService);
  private readonly reservationService = inject(ReservationService);

  readonly parkingSpaceId = this.route.snapshot.paramMap.get('parkingSpaceId') ?? '';

  readonly parkingSpace = signal<ParkingSpace | null>(null);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly serverError = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    startAt: ['', Validators.required],
    endAt: ['', Validators.required],
  });

  ionViewWillEnter(): void {
    this.loadParkingSpace();
  }

  loadParkingSpace(): void {
    this.isLoading.set(true);
    this.serverError.set('');

    this.parkingService
      .getParkingSpace(this.parkingSpaceId)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: parkingSpace => {
          this.parkingSpace.set(parkingSpace);
        },
        error: () => {
          this.parkingSpace.set(null);
          this.serverError.set(
            'Parking mesto nije pronađeno.',
          );
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const startAt =
      new Date(value.startAt);

    const endAt =
      new Date(value.endAt);

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime())
    ) {
      this.serverError.set(
        'Unesite ispravan datum i vreme.',
      );
      return;
    }

    if (startAt >= endAt) {
      this.serverError.set(
        'Vreme početka mora biti pre vremena završetka.',
      );
      return;
    }

    if (startAt <= new Date()) {
      this.serverError.set(
        'Rezervacija mora početi u budućnosti.',
      );
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set('');

    this.reservationService
      .create({
        parkingSpaceId:
          this.parkingSpaceId,
        startAt:
          startAt.toISOString(),
        endAt:
          endAt.toISOString(),
      })
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(
            '/my-reservations',
          );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          if (error.status === 409) {
            this.serverError.set(
              'Parking mesto je već rezervisano u izabranom terminu.',
            );
            return;
          }

          if (error.status === 400) {
            this.serverError.set(
              'Izabrani termin nije ispravan.',
            );
            return;
          }

          if (error.status === 404) {
            this.serverError.set(
              'Parking mesto više nije dostupno.',
            );
            return;
          }

          this.serverError.set(
            'Kreiranje rezervacije nije uspelo.',
          );
        },
      });
  }

  occupancyLabel(): string {
    switch (
    this.parkingSpace()?.occupancyStatus
    ) {
      case 'FREE':
        return 'Slobodno';

      case 'OCCUPIED':
        return 'Zauzeto';

      default:
        return 'Nepoznato';
    }
  }
}