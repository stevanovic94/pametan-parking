import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
} from "@ionic/angular";
import { finalize } from "rxjs";
import { Reservation } from "../../../core/reservations/models/reservation.model";
import { ReservationStatus } from "../../../core/reservations/models/reservation-status.type";
import { ReservationService } from "../../../core/reservations/reservation.service";
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
	selector: "app-my-reservations",
	templateUrl: "./my-reservations.page.html",
	styleUrls: ["./my-reservations.page.scss"],
	imports: [
		BackButtonComponent,
		DatePipe,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
		IonButton,
	],
})
export class MyReservationsPage {
	private readonly reservationService = inject(ReservationService);

	readonly reservations = signal<Reservation[]>([]);

	readonly isLoading = signal(false);
	readonly cancellingId = signal<string | null>(null);
	readonly serverError = signal("");
	readonly successMessage = signal("");

	ionViewWillEnter(): void {
		this.loadReservations();
	}

	loadReservations(): void {
		this.isLoading.set(true);
		this.serverError.set("");

		this.reservationService
			.getMine()
			.pipe(
				finalize(() => {
					this.isLoading.set(false);
				}),
			)
			.subscribe({
				next: (reservations) => {
					this.reservations.set(reservations);
				},

				error: () => {
					this.reservations.set([]);
					this.serverError.set("Učitavanje rezervacija nije uspelo.");
				},
			});
	}

	cancel(reservation: Reservation): void {
		if (reservation.status !== "CONFIRMED") {
			return;
		}

		this.cancellingId.set(reservation.id);

		this.serverError.set("");
		this.successMessage.set("");

		this.reservationService
			.cancel(reservation.id)
			.pipe(
				finalize(() => {
					this.cancellingId.set(null);
				}),
			)
			.subscribe({
				next: (updatedReservation) => {
					this.reservations.update((reservations) =>
						reservations.map((reservationItem) =>
							reservationItem.id === updatedReservation.id
								? updatedReservation
								: reservationItem,
						),
					);

					this.successMessage.set("Rezervacija je uspešno otkazana.");
				},

				error: () => {
					this.serverError.set("Otkazivanje rezervacije nije uspelo.");
				},
			});
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
