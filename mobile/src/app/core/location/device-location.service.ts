import { Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Geolocation, PermissionStatus } from "@capacitor/geolocation";
import { UserLocation } from "./models/user-location.model";

@Injectable({
	providedIn: "root",
})
export class DeviceLocationService {
	async getCurrentLocation(): Promise<UserLocation> {
		if (Capacitor.getPlatform() !== "web") {
			let permissionStatus = await Geolocation.checkPermissions();

			if (!this.hasLocationPermission(permissionStatus)) {
				permissionStatus = await Geolocation.requestPermissions({
					permissions: ["location"],
				});
			}

			if (!this.hasLocationPermission(permissionStatus)) {
				throw new Error("Dozvola za lokaciju nije odobrena.");
			}
		}

		const position = await Geolocation.getCurrentPosition({
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 60000,
		});

		return {
			latitude: position.coords.latitude,

			longitude: position.coords.longitude,

			accuracy: position.coords.accuracy,
		};
	}

	calculateDistanceKm(
		fromLatitude: number,
		fromLongitude: number,
		toLatitude: number,
		toLongitude: number,
	): number {
		const earthRadiusKm = 6371;

		const latitudeDifference = this.toRadians(toLatitude - fromLatitude);

		const longitudeDifference = this.toRadians(toLongitude - fromLongitude);

		const fromLatitudeRadians = this.toRadians(fromLatitude);

		const toLatitudeRadians = this.toRadians(toLatitude);

		const a =
			Math.sin(latitudeDifference / 2) ** 2 +
			Math.cos(fromLatitudeRadians) *
				Math.cos(toLatitudeRadians) *
				Math.sin(longitudeDifference / 2) ** 2;

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return earthRadiusKm * c;
	}

	private hasLocationPermission(permissionStatus: PermissionStatus): boolean {
		return (
			permissionStatus.location === "granted" ||
			permissionStatus.coarseLocation === "granted"
		);
	}

	private toRadians(degrees: number): number {
		return (degrees * Math.PI) / 180;
	}
}
