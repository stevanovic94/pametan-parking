import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
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
} from "@ionic/angular";
import { finalize, Observable } from "rxjs";
import { ParkingLot } from "../../../core/parking/models/parking-lot.model";
import { ParkingService } from "../../../core/parking/parking.service";
import { LogoutButtonComponent } from "../../../shared/components/logout-button/logout-button.component";
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
	selector: "app-parking-lots-admin",
	templateUrl: "./parking-lots-admin.page.html",
	styleUrls: ["./parking-lots-admin.page.scss"],
	imports: [
    BackButtonComponent,
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

	readonly parkingLots = signal<ParkingLot[]>([]);

	readonly editingId = signal<string | null>(null);

	readonly serverError = signal("");

	readonly isLoading = signal(false);

	readonly isSubmitting = signal(false);

	readonly form = this.formBuilder.nonNullable.group({
		name: ["", [Validators.required, Validators.maxLength(100)]],

		address: ["", [Validators.required, Validators.maxLength(255)]],

		description: ["", [Validators.maxLength(500)]],

		latitude: [
			"",
			[Validators.required, Validators.min(-90), Validators.max(90)],
		],

		longitude: [
			"",
			[Validators.required, Validators.min(-180), Validators.max(180)],
		],
	});

	ionViewWillEnter(): void {
		this.loadParkingLots();
	}

	loadParkingLots(): void {
		this.isLoading.set(true);
		this.serverError.set("");

		this.parkingService
			.getAdminParkingLots()
			.pipe(
				finalize(() => {
					this.isLoading.set(false);
				}),
			)
			.subscribe({
				next: (parkingLots) => {
					this.parkingLots.set(parkingLots);
				},

				error: () => {
					this.parkingLots.set([]);

					this.serverError.set("Učitavanje parking lokacija nije uspelo.");
				},
			});
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();

		const latitude = Number(value.latitude);

		const longitude = Number(value.longitude);

		this.isSubmitting.set(true);
		this.serverError.set("");

		const currentEditingId = this.editingId();

		const request$: Observable<ParkingLot> = currentEditingId
			? this.parkingService.updateParkingLot(currentEditingId, {
					name: value.name,

					address: value.address,

					description: value.description,

					latitude,
					longitude,
				})
			: this.parkingService.createParkingLot({
					name: value.name,

					address: value.address,

					description: value.description,

					latitude,
					longitude,
				});

		request$
			.pipe(
				finalize(() => {
					this.isSubmitting.set(false);
				}),
			)
			.subscribe({
				next: () => {
					this.cancelEdit();
					this.loadParkingLots();
				},

				error: () => {
					this.serverError.set("Čuvanje parking lokacije nije uspelo.");
				},
			});
	}

	edit(parkingLot: ParkingLot): void {
		this.editingId.set(parkingLot.id);

		this.form.setValue({
			name: parkingLot.name,

			address: parkingLot.address,

			description: parkingLot.description ?? "",

			latitude: parkingLot.latitude?.toString() ?? "",

			longitude: parkingLot.longitude?.toString() ?? "",
		});
	}

	cancelEdit(): void {
		this.editingId.set(null);

		this.form.reset({
			name: "",
			address: "",
			description: "",
			latitude: "",
			longitude: "",
		});
	}

	toggleActive(parkingLot: ParkingLot): void {
		this.serverError.set("");

		if (parkingLot.isActive) {
			this.parkingService.deactivateParkingLot(parkingLot.id).subscribe({
				next: () => {
					this.loadParkingLots();
				},

				error: () => {
					this.serverError.set("Promena statusa parking lokacije nije uspela.");
				},
			});

			return;
		}

		this.parkingService
			.updateParkingLot(parkingLot.id, {
				isActive: true,
			})
			.subscribe({
				next: () => {
					this.loadParkingLots();
				},

				error: () => {
					this.serverError.set("Promena statusa parking lokacije nije uspela.");
				},
			});
	}
}
