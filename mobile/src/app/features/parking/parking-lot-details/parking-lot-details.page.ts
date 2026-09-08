import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { finalize, forkJoin } from 'rxjs';
import { ParkingLot } from '../../../core/parking/models/parking-lot.model';
import { ParkingSpace } from '../../../core/parking/models/parking-space.model';
import { ParkingSpaceOccupancy } from '../../../core/parking/models/parking-space-occupancy.type';
import { ParkingService } from '../../../core/parking/parking.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-parking-lot-details',
  templateUrl: './parking-lot-details.page.html',
  styleUrls: ['./parking-lot-details.page.scss'],
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

export class ParkingLotDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly parkingService = inject(ParkingService);

  readonly parkingLotId =
    this.route.snapshot.paramMap.get('parkingLotId') ?? '';

  readonly parkingLot = signal<ParkingLot | null>(null);
  readonly parkingSpaces = signal<ParkingSpace[]>([]);
  readonly isLoading = signal(false);
  readonly serverError = signal('');

  readonly freeCount = computed(() =>
    this.parkingSpaces().filter(
      space => space.occupancyStatus === 'FREE',
    ).length,
  );

  readonly occupiedCount = computed(() =>
    this.parkingSpaces().filter(
      space => space.occupancyStatus === 'OCCUPIED',
    ).length,
  );

  readonly unknownCount = computed(() =>
    this.parkingSpaces().filter(
      space => space.occupancyStatus === 'UNKNOWN',
    ).length,
  );

  ionViewWillEnter(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.serverError.set('');

    forkJoin({
      parkingLot: this.parkingService.getParkingLot(this.parkingLotId),
      parkingSpaces:
        this.parkingService.getParkingSpaces(this.parkingLotId),
    })
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: response => {
          this.parkingLot.set(response.parkingLot);
          this.parkingSpaces.set(response.parkingSpaces);
        },
        error: () => {
          this.parkingLot.set(null);
          this.parkingSpaces.set([]);
          this.serverError.set(
            'Učitavanje podataka o parkingu nije uspelo.',
          );
        },
      });
  }

  occupancyLabel(status: ParkingSpaceOccupancy): string {
    switch (status) {
      case 'FREE':
        return 'Slobodno';
      case 'OCCUPIED':
        return 'Zauzeto';
      default:
        return 'Nepoznato';
    }
  }
}