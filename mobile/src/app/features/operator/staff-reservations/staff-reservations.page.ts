import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonItem,
	IonLabel,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar,
} from "@ionic/angular";
import { finalize } from "rxjs";
import { ParkingLot } from "../../../core/parking/models/parking-lot.model";
import { ParkingService } from "../../../core/parking/parking.service";
import { ReservationStatus } from "../../../core/reservations/models/reservation-status.type";
import { StaffReservation } from "../../../core/reservations/models/staff-reservation.model";
import { ReservationService } from "../../../core/reservations/reservation.service";

@Component({
	selector: "app-staff-reservations",
	templateUrl: "./staff-reservations.page.html",
	styleUrls: ["./staff-reservations.page.scss"],
	imports: [
		DatePipe,
		ReactiveFormsModule,
		RouterLink,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		IonItem,
		IonLabel,
		IonSelect,
		IonSelectOption,
		IonButton,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
	],
})
export class StaffReservationsPage {
	private readonly formBuilder = inject(FormBuilder);

	private readonly reservationService = inject(ReservationService);

	private readonly parkingService = inject(ParkingService);

	readonly reservations = signal<StaffReservation[]>([]);

	readonly parkingLots = signal<ParkingLot[]>([]);

	readonly isLoading = signal(false);

	readonly serverError = signal("");

	readonly filterForm = this.formBuilder.nonNullable.group({
		parkingLotId: [""],
		status: [""],
	});

	ionViewWillEnter(): void {
		this.loadParkingLots();
		this.loadReservations();
	}

	loadParkingLots(): void {
		this.parkingService.getParkingLots().subscribe({
			next: (parkingLots) => {
				this.parkingLots.set(parkingLots);
			},

			error: () => {
				this.parkingLots.set([]);
			},
		});
	}

	loadReservations(): void {
		const filters = this.filterForm.getRawValue();

		this.isLoading.set(true);
		this.serverError.set("");

		this.reservationService
      .getAllForStaff({
        parkingLotId:
          filters.parkingLotId ||
          undefined,

        status:
          filters.status
            ? filters.status as ReservationStatus
            : undefined,
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: reservations => {
          this.reservations.set(
            reservations,
          );
        },

        error: () => {
          this.reservations.set([]);

          this.serverError.set(
            'Učitavanje rezervacija nije uspelo.',
          );
        },
      });
	}

	applyFilters(): void {
		this.loadReservations();
	}

	clearFilters(): void {
		this.filterForm.reset({
			parkingLotId: "",
			status: "",
		});

		this.loadReservations();
	}

	statusLabel(status: ReservationStatus): string {
		switch (status) {
			case "CONFIRMED":
				return "Potvrđena";

			case "CANCELLED":
				return "Otkazana";

			case "COMPLETED":
				return "Završena";
		}
	}
}
