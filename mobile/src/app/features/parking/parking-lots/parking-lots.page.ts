import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { finalize } from 'rxjs';
import { ParkingLotOverview } from '../../../core/parking/models/parking-lot-overview.model';
import { ParkingService } from '../../../core/parking/parking.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-parking-lots',
  templateUrl: './parking-lots.page.html',
  styleUrls: ['./parking-lots.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    LogoutButtonComponent,
  ],
})
export class ParkingLotsPage {
  private readonly parkingService = inject(ParkingService);

  readonly parkingLots = signal<ParkingLotOverview[]>([]);
  readonly isLoading = signal(false);
  readonly serverError = signal('');

  ionViewWillEnter(): void {
    this.loadParkingLots();
  }

  loadParkingLots(): void {
    this.isLoading.set(true);
    this.serverError.set('');

    this.parkingService
      .getParkingOverview()
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: parkingLots => {
          this.parkingLots.set(parkingLots);
        },
        error: () => {
          this.parkingLots.set([]);
          this.serverError.set(
            'Učitavanje parking lokacija nije uspelo.',
          );
        },
      });
  }
}