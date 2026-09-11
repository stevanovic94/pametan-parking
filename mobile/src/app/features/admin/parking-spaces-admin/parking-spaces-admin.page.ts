import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { finalize } from 'rxjs';
import { ParkingLot } from '../../../core/parking/models/parking-lot.model';
import { ParkingSpace } from '../../../core/parking/models/parking-space.model';
import { ParkingService } from '../../../core/parking/parking.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
  selector: 'app-parking-spaces-admin',
  templateUrl: './parking-spaces-admin.page.html',
  styleUrls: ['./parking-spaces-admin.page.scss'],
  imports: [
    BackButtonComponent,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    LogoutButtonComponent,
  ],
})
export class ParkingSpacesAdminPage {
  private readonly route = inject(ActivatedRoute);
  private readonly parkingService = inject(ParkingService);
  private readonly formBuilder = inject(FormBuilder);

  readonly parkingLotId =
    this.route.snapshot.paramMap.get('parkingLotId') ?? '';

  readonly parkingLot = signal<ParkingLot | null>(null);
  readonly parkingSpaces = signal<ParkingSpace[]>([]);
  readonly parkingLotLoaded = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly serverError = signal('');
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    code: ['', [
      Validators.required,
      Validators.maxLength(20),
    ]],
  });

  ionViewWillEnter(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.parkingLotLoaded.set(false);
    this.serverError.set('');

    this.parkingService.getAdminParkingLots().subscribe({
      next: (parkingLots) => {
        const parkingLot = parkingLots.find(
          parkingLot => parkingLot.id === this.parkingLotId,
        ) ?? null;

        this.parkingLot.set(parkingLot);
        this.parkingLotLoaded.set(true);
      },
      error: () => {
        this.parkingLot.set(null);
        this.parkingLotLoaded.set(true);
        this.serverError.set('Parking lokacija nije pronađena.');
      },
    });

    this.parkingService
      .getAdminParkingSpaces(this.parkingLotId)
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (parkingSpaces) => {
          this.parkingSpaces.set(parkingSpaces);
        },
        error: () => {
          this.parkingSpaces.set([]);
          this.serverError.set('Učitavanje parking mesta nije uspelo.');
        },
      });
  }

  submit(): void {
    const parkingLot = this.parkingLot();

    if (this.form.invalid || !parkingLot?.isActive) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.serverError.set('');

    const editingId = this.editingId();

    if (editingId) {
      this.parkingService
        .updateParkingSpace(editingId, {
          code: value.code,
        })
        .pipe(finalize(() => {
          this.isSubmitting.set(false);
        }))
        .subscribe({
          next: () => {
            this.cancelEdit();
            this.loadData();
          },
          error: (error) => {
            this.handleSaveError(error);
          },
        });

      return;
    }

    this.parkingService
      .createParkingSpace({
        parkingLotId: this.parkingLotId,
        code: value.code,
      })
      .pipe(finalize(() => {
        this.isSubmitting.set(false);
      }))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.loadData();
        },
        error: (error) => {
          this.handleSaveError(error);
        },
      });
  }

  edit(parkingSpace: ParkingSpace): void {
    this.editingId.set(parkingSpace.id);

    this.form.setValue({
      code: parkingSpace.code,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);

    this.form.reset({
      code: '',
    });
  }

  toggleActive(parkingSpace: ParkingSpace): void {
    this.serverError.set('');

    if (parkingSpace.isActive) {
      this.parkingService
        .deactivateParkingSpace(parkingSpace.id)
        .subscribe({
          next: () => this.loadData(),
          error: () => {
            this.serverError.set(
              'Promena statusa parking mesta nije uspela.',
            );
          },
        });

      return;
    }

    this.parkingService
      .updateParkingSpace(parkingSpace.id, {
        isActive: true,
      })
      .subscribe({
        next: () => this.loadData(),
        error: () => {
          this.serverError.set(
            'Promena statusa parking mesta nije uspela.',
          );
        },
      });
  }

  private handleSaveError(error: { status?: number }): void {
    if (error.status === 409) {
      this.serverError.set(
        'Parking mesto sa ovom oznakom već postoji.',
      );
      return;
    }

    this.serverError.set(
      'Čuvanje parking mesta nije uspelo.',
    );
  }
}