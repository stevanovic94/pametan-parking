import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { finalize } from 'rxjs';
import { ParkingLot } from '../../../core/parking/models/parking-lot.model';
import { ParkingService } from '../../../core/parking/parking.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-parking-lots-admin',
  templateUrl: './parking-lots-admin.page.html',
  styleUrls: ['./parking-lots-admin.page.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    LogoutButtonComponent,
  ],
})
export class ParkingLotsAdminPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingService = inject(ParkingService);

  parkingLots: ParkingLot[] = [];
  editingId: string | null = null;
  serverError = '';
  isLoading = false;
  isSubmitting = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(100),
    ]],
    address: ['', [
      Validators.required,
      Validators.maxLength(255),
    ]],
    description: ['', [
      Validators.maxLength(500),
    ]],
  });

  ionViewWillEnter(): void {
    this.loadParkingLots();
  }

  loadParkingLots(): void {
    this.isLoading = true;
    this.serverError = '';

    this.parkingService.getAdminParkingLots()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (parkingLots) => {
          this.parkingLots = parkingLots;
        },
        error: () => {
          this.serverError = 'Učitavanje parking lokacija nije uspelo.';
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.isSubmitting = true;
    this.serverError = '';

    const request$ = this.editingId
      ? this.parkingService.updateParkingLot(this.editingId, {
          name: value.name,
          address: value.address,
          description: value.description,
        })
      : this.parkingService.createParkingLot({
          name: value.name,
          address: value.address,
          description: value.description,
        });

    request$
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.loadParkingLots();
        },
        error: () => {
          this.serverError = 'Čuvanje parking lokacije nije uspelo.';
        },
      });
  }

  edit(parkingLot: ParkingLot): void {
    this.editingId = parkingLot.id;

    this.form.setValue({
      name: parkingLot.name,
      address: parkingLot.address,
      description: parkingLot.description ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId = null;

    this.form.reset({
      name: '',
      address: '',
      description: '',
    });
  }

  toggleActive(parkingLot: ParkingLot): void {
    if (parkingLot.isActive) {
      this.parkingService.deactivateParkingLot(parkingLot.id).subscribe({
        next: () => this.loadParkingLots(),
        error: () => {
          this.serverError = 'Promena statusa parking lokacije nije uspela.';
        },
      });
      return;
    }

    this.parkingService.updateParkingLot(parkingLot.id, {
      isActive: true,
    }).subscribe({
      next: () => this.loadParkingLots(),
      error: () => {
        this.serverError = 'Promena statusa parking lokacije nije uspela.';
      },
    });
  }
}