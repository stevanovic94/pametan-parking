import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
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
import { ParkingSpaceOccupancy } from "../../../core/parking/models/parking-space-occupancy.type";
import { ParkingLot } from "../../../core/parking/models/parking-lot.model";
import { ParkingSpace } from "../../../core/parking/models/parking-space.model";
import { ParkingOccupancyService } from "../../../core/parking/parking-occupancy.service";
import { ParkingService } from "../../../core/parking/parking.service";
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
	selector: "app-parking-occupancy",
	templateUrl: "./parking-occupancy.page.html",
	styleUrls: ["./parking-occupancy.page.scss"],
	imports: [
		BackButtonComponent,
		ReactiveFormsModule,
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
export class ParkingOccupancyPage {
	private readonly formBuilder = inject(FormBuilder);

	private readonly parkingService = inject(ParkingService);

	private readonly parkingOccupancyService = inject(ParkingOccupancyService);

	readonly parkingLots = signal<ParkingLot[]>([]);

	readonly parkingSpaces = signal<ParkingSpace[]>([]);

	readonly isLoading = signal(false);

	readonly updatingId = signal<string | null>(null);

	readonly serverError = signal("");

	readonly successMessage = signal("");

	readonly filterForm = this.formBuilder.nonNullable.group({
		parkingLotId: [""],
	});

	ionViewWillEnter(): void {
		this.loadParkingLots();
	}

	loadParkingLots(): void {
		this.serverError.set("");

		this.parkingService.getParkingLots().subscribe({
			next: (parkingLots) => {
				this.parkingLots.set(parkingLots);
			},

			error: () => {
				this.parkingLots.set([]);

				this.serverError.set("Učitavanje parking lokacija nije uspelo.");
			},
		});
	}

	parkingLotChanged(): void {
		const parkingLotId = this.filterForm.controls.parkingLotId.value;

		this.parkingSpaces.set([]);
		this.successMessage.set("");
		this.serverError.set("");

		if (!parkingLotId) {
			return;
		}

		this.loadParkingSpaces(parkingLotId);
	}

	loadParkingSpaces(parkingLotId: string): void {
		this.isLoading.set(true);
		this.serverError.set("");

		this.parkingOccupancyService
			.getParkingSpaces(parkingLotId)
			.pipe(
				finalize(() => {
					this.isLoading.set(false);
				}),
			)
			.subscribe({
				next: (parkingSpaces) => {
					this.parkingSpaces.set(parkingSpaces);
				},

				error: () => {
					this.parkingSpaces.set([]);

					this.serverError.set("Učitavanje parking mesta nije uspelo.");
				},
			});
	}

	setOccupancy(
		parkingSpace: ParkingSpace,
		occupancyStatus: ParkingSpaceOccupancy,
	): void {
		this.updatingId.set(parkingSpace.id);

		this.serverError.set("");
		this.successMessage.set("");

		this.parkingOccupancyService
			.updateOccupancy(parkingSpace.id, occupancyStatus)
			.pipe(
				finalize(() => {
					this.updatingId.set(null);
				}),
			)
			.subscribe({
				next: (updatedParkingSpace) => {
					this.parkingSpaces.update((parkingSpaces) =>
						parkingSpaces.map((item) =>
							item.id === updatedParkingSpace.id ? updatedParkingSpace : item,
						),
					);

					this.successMessage.set(
						`Stanje mesta ${updatedParkingSpace.code} je ažurirano.`,
					);
				},

				error: () => {
					this.serverError.set(
						"Promena fizičkog stanja parking mesta nije uspela.",
					);
				},
			});
	}

	occupancyLabel(occupancyStatus: ParkingSpaceOccupancy): string {
		switch (occupancyStatus) {
			case "FREE":
				return "Slobodno";

			case "OCCUPIED":
				return "Zauzeto";

			case "UNKNOWN":
				return "Nepoznato";
		}
	}
}
