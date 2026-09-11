import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
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
import { ParkingAccessResult } from "../../../core/parking-events/models/parking-access-result.type";
import { ParkingEvent } from "../../../core/parking-events/models/parking-event.model";
import { ParkingEventType } from "../../../core/parking-events/models/parking-event-type.type";
import { ParkingEventsService } from "../../../core/parking-events/parking-events.service";
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
	selector: "app-my-parking-events",
	templateUrl: "./my-parking-events.page.html",
	styleUrls: ["./my-parking-events.page.scss"],
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
	],
})
export class MyParkingEventsPage {
	private readonly parkingEventsService = inject(ParkingEventsService);

	readonly parkingEvents = signal<ParkingEvent[]>([]);

	readonly isLoading = signal(false);

	readonly serverError = signal("");

	ionViewWillEnter(): void {
		this.loadParkingEvents();
	}

	loadParkingEvents(): void {
		this.isLoading.set(true);
		this.serverError.set("");

		this.parkingEventsService
			.getMine()
			.pipe(
				finalize(() => {
					this.isLoading.set(false);
				}),
			)
			.subscribe({
				next: (parkingEvents) => {
					this.parkingEvents.set(parkingEvents);
				},

				error: () => {
					this.parkingEvents.set([]);

					this.serverError.set("Učitavanje istorije pristupa nije uspelo.");
				},
			});
	}

	typeLabel(type: ParkingEventType): string {
		switch (type) {
			case "ENTRY":
				return "Ulazak";

			case "EXIT":
				return "Izlazak";
		}
	}

	resultLabel(result: ParkingAccessResult): string {
		switch (result) {
			case "GRANTED":
				return "Odobren";

			case "DENIED":
				return "Odbijen";
		}
	}
}
