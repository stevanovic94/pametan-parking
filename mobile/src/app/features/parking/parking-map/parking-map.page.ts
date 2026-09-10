import { Component, computed, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
	IonButton,
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
} from "@ionic/angular";
import * as L from "leaflet";
import { finalize } from "rxjs";
import { DeviceLocationService } from "../../../core/location/device-location.service";
import { UserLocation } from "../../../core/location/models/user-location.model";
import { ParkingMapLocation } from "../../../core/parking-map/models/parking-map-location.model";
import { ParkingMapService } from "../../../core/parking-map/parking-map.service";

@Component({
	selector: "app-parking-map",
	templateUrl: "./parking-map.page.html",
	styleUrls: ["./parking-map.page.scss"],
	imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class ParkingMapPage {
	private readonly parkingMapService = inject(ParkingMapService);
	private readonly deviceLocationService = inject(DeviceLocationService);
	private readonly router = inject(Router);

	private map: L.Map | null = null;
	private parkingMarkersLayer: L.LayerGroup | null = null;
	private userLocationLayer: L.LayerGroup | null = null;

	readonly parkingLocations = signal<ParkingMapLocation[]>([]);
	readonly userLocation = signal<UserLocation | null>(null);
	readonly isLoading = signal(false);
	readonly isLocating = signal(false);
	readonly serverError = signal("");
	readonly locationError = signal("");

	readonly sortedParkingLocations = computed(() => {
		const userLocation = this.userLocation();

		return this.parkingLocations()
			.filter((parkingLocation) => parkingLocation.isActive)
			.map((parkingLocation) => ({
				...parkingLocation,
				distanceKm: userLocation
					? this.deviceLocationService.calculateDistanceKm(
							userLocation.latitude,
							userLocation.longitude,
							parkingLocation.latitude,
							parkingLocation.longitude,
						)
					: null,
			}))
			.sort((first, second) => {
				if (first.distanceKm === null || second.distanceKm === null) {
					return 0;
				}

				return first.distanceKm - second.distanceKm;
			});
	});

	ionViewDidEnter(): void {
		this.initializeMap();
		this.loadParkingLocations();
	}

	ionViewDidLeave(): void {
		this.destroyMap();
	}

	async locateUser(): Promise<void> {
		this.isLocating.set(true);
		this.locationError.set("");

		try {
			const userLocation =
				await this.deviceLocationService.getCurrentLocation();

			this.userLocation.set(userLocation);
			this.renderUserLocation();
			this.renderParkingMarkers();
			this.fitMapToContent();
		} catch {
			this.userLocation.set(null);
			this.userLocationLayer?.clearLayers();

			this.locationError.set(
				"Lokacija nije dostupna. Proveri da li je uključena lokacija i da li je dozvola odobrena.",
			);
		} finally {
			this.isLocating.set(false);
		}
	}

	openParking(parkingLotId: string): void {
		void this.router.navigate(["/parking-lots", parkingLotId]);
	}

	formatDistance(distanceKm: number | null): string {
		if (distanceKm === null) {
			return "";
		}

		if (distanceKm < 1) {
			return `${Math.round(distanceKm * 1000)} m`;
		}

		return `${distanceKm.toFixed(2)} km`;
	}

	private initializeMap(): void {
		if (this.map) {
			return;
		}

		const container = document.getElementById("parking-map");

		if (!container) {
			return;
		}

		this.map = L.map(container).setView([44.0165, 21.0059], 7);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution: "&copy; OpenStreetMap contributors",
		}).addTo(this.map);

		this.parkingMarkersLayer = L.layerGroup().addTo(this.map);

		this.userLocationLayer = L.layerGroup().addTo(this.map);

		this.map.invalidateSize();
	}

	private loadParkingLocations(): void {
		this.isLoading.set(true);
		this.serverError.set("");

		this.parkingMapService
			.getMapLocations()
			.pipe(
				finalize(() => {
					this.isLoading.set(false);
				}),
			)
			.subscribe({
				next: (parkingLocations) => {
					this.parkingLocations.set(parkingLocations);

					this.renderParkingMarkers();
					this.fitMapToContent();
				},

				error: () => {
					this.parkingLocations.set([]);

					this.serverError.set(
						"Učitavanje parking lokacija za mapu nije uspelo.",
					);

					this.parkingMarkersLayer?.clearLayers();
				},
			});
	}

	private renderParkingMarkers(): void {
		if (!this.map || !this.parkingMarkersLayer) {
			return;
		}

		this.parkingMarkersLayer.clearLayers();

		for (const parkingLocation of this.parkingLocations()) {
			const marker = L.marker(
				[parkingLocation.latitude, parkingLocation.longitude],
				{
					icon: this.createParkingIcon(parkingLocation),
				},
			);

			marker.bindPopup(this.createPopupContent(parkingLocation));

			marker.addTo(this.parkingMarkersLayer);
		}
	}

	private renderUserLocation(): void {
		if (!this.map || !this.userLocationLayer) {
			return;
		}

		this.userLocationLayer.clearLayers();

		const userLocation = this.userLocation();

		if (!userLocation) {
			return;
		}

		const marker = L.circleMarker(
			[userLocation.latitude, userLocation.longitude],
			{
				radius: 9,
				weight: 3,
				color: "#ffffff",
				fillColor: "#1976d2",
				fillOpacity: 1,
			},
		);

		marker.bindPopup(
			`Moja lokacija<br>Preciznost: približno ${Math.round(
				userLocation.accuracy,
			)} m`,
		);

		marker.addTo(this.userLocationLayer);
	}

	private fitMapToContent(): void {
		if (!this.map) {
			return;
		}

		const coordinates: L.LatLngTuple[] = this.parkingLocations().map(
			(parkingLocation) =>
				[parkingLocation.latitude, parkingLocation.longitude] as L.LatLngTuple,
		);

		const userLocation = this.userLocation();

		if (userLocation) {
			coordinates.push([userLocation.latitude, userLocation.longitude]);
		}

		if (coordinates.length === 0) {
			this.map.setView([44.0165, 21.0059], 7);

			return;
		}

		if (coordinates.length === 1) {
			this.map.setView(coordinates[0], 15);

			return;
		}

		this.map.fitBounds(L.latLngBounds(coordinates), {
			padding: [40, 40],
		});
	}

	private createParkingIcon(parkingLocation: ParkingMapLocation): L.DivIcon {
		const background = parkingLocation.isActive ? "#2563eb" : "#8e8e93";

		return L.divIcon({
			className: "",

			html: `
				<div
					style="
						width: 36px;
						height: 36px;
						display: flex;
						align-items: center;
						justify-content: center;
						border-radius: 50%;
						background: ${background};
						color: white;
						border: 3px solid white;
						box-shadow: 0 2px 6px rgba(0,0,0,0.35);
						font-weight: 700;
						font-size: 18px;
					">
					P
				</div>
			`,

			iconSize: [36, 36],
			iconAnchor: [18, 18],
			popupAnchor: [0, -20],
		});
	}

	private createPopupContent(parkingLocation: ParkingMapLocation): HTMLElement {
		const container = document.createElement("div");

		const title = document.createElement("strong");

		title.textContent = parkingLocation.name;

		container.append(title);

		const total = document.createElement("p");

		total.textContent = `Ukupno mesta: ${parkingLocation.spaceStats.total}`;

		if (!parkingLocation.isActive) {
			container.append(total);

			return container;
		}

		const address = document.createElement("p");

		address.textContent = parkingLocation.address;

		const free = document.createElement("p");

		free.textContent = `Slobodno: ${parkingLocation.spaceStats.free}`;

		const reserved = document.createElement("p");

		reserved.textContent = `Rezervisano: ${parkingLocation.spaceStats.reserved}`;

		const occupied = document.createElement("p");

		occupied.textContent = `Zauzeto: ${parkingLocation.spaceStats.occupied}`;

		const unknown = document.createElement("p");

		unknown.textContent = `Nepoznato: ${parkingLocation.spaceStats.unknown}`;

		container.append(address, free, reserved, occupied, unknown, total);

		const userLocation = this.userLocation();

		if (userLocation) {
			const distance = this.deviceLocationService.calculateDistanceKm(
				userLocation.latitude,
				userLocation.longitude,
				parkingLocation.latitude,
				parkingLocation.longitude,
			);

			const distanceElement = document.createElement("p");

			distanceElement.textContent = `Udaljenost: ${this.formatDistance(
				distance,
			)}`;

			container.append(distanceElement);
		}

		const button = document.createElement("button");

		button.type = "button";
		button.textContent = "Pogledaj parking";
		button.style.width = "100%";
		button.style.padding = "9px 12px";
		button.style.marginTop = "8px";
		button.style.border = "none";
		button.style.borderRadius = "6px";
		button.style.background = "#2563eb";
		button.style.color = "#ffffff";
		button.style.cursor = "pointer";
		button.style.fontWeight = "600";

		button.addEventListener("click", () => {
			this.openParking(parkingLocation.id);
		});

		container.append(button);

		return container;
	}

	private destroyMap(): void {
		this.parkingMarkersLayer = null;
		this.userLocationLayer = null;

		if (!this.map) {
			return;
		}

		this.map.remove();
		this.map = null;
	}
}
