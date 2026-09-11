import { DatePipe } from "@angular/common";
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
import { ParkingAccessResult } from "../../../core/parking-events/models/parking-access-result.type";
import { ParkingEventType } from "../../../core/parking-events/models/parking-event-type.type";
import { StaffParkingEvent } from "../../../core/parking-events/models/staff-parking-event.model";
import { ParkingEventsService } from "../../../core/parking-events/parking-events.service";
import { ParkingLot } from "../../../core/parking/models/parking-lot.model";
import { ParkingService } from "../../../core/parking/parking.service";
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
	selector: "app-staff-parking-events",
	templateUrl: "./staff-parking-events.page.html",
	styleUrls: ["./staff-parking-events.page.scss"],
	imports: [
    BackButtonComponent,
		DatePipe,
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
export class StaffParkingEventsPage {
	private readonly formBuilder = inject(FormBuilder);

	private readonly parkingEventsService = inject(ParkingEventsService);

	private readonly parkingService = inject(ParkingService);

	readonly parkingEvents = signal<StaffParkingEvent[]>([]);

	readonly parkingLots = signal<ParkingLot[]>([]);

	readonly isLoading = signal(false);

	readonly serverError = signal("");

	readonly filterForm = this.formBuilder.nonNullable.group({
		parkingLotId: [""],
		type: [""],
		result: [""],
	});

	ionViewWillEnter(): void {
		this.loadParkingLots();
		this.loadParkingEvents();
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

	loadParkingEvents(): void {
		const filters = this.filterForm.getRawValue();

		this.isLoading.set(true);
		this.serverError.set("");

		this.parkingEventsService
      .getAllForStaff({
        parkingLotId: filters.parkingLotId || undefined,

        type: filters.type ? filters.type as ParkingEventType: undefined,

        result: filters.result ? filters.result as ParkingAccessResult: undefined,
      })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: parkingEvents => {
          this.parkingEvents.set(
            parkingEvents,
          );
        },

        error: () => {
          this.parkingEvents.set([]);

          this.serverError.set(
            'Učitavanje parking događaja nije uspelo.',
          );
        },
      });
	}

	applyFilters(): void {
		this.loadParkingEvents();
	}

	clearFilters(): void {
		this.filterForm.reset({
			parkingLotId: "",
			type: "",
			result: "",
		});

		this.loadParkingEvents();
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
