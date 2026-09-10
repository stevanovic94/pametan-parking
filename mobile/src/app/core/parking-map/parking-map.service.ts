import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ParkingLotOverview } from "../parking/models/parking-lot-overview.model";
import { ParkingService } from "../parking/parking.service";
import { ParkingMapLocation } from "./models/parking-map-location.model";

@Injectable({
	providedIn: "root",
})
export class ParkingMapService {
	private readonly parkingService = inject(ParkingService);

	getMapLocations(): Observable<ParkingMapLocation[]> {
		return this.parkingService.getParkingMapOverview().pipe(
			map((parkingLots) =>
				parkingLots
					.filter(
						(
							parkingLot,
						): parkingLot is ParkingLotOverview & {
							latitude: number;
							longitude: number;
						} => parkingLot.latitude !== null && parkingLot.longitude !== null,
					)
					.map((parkingLot) => ({
						id: parkingLot.id,
						name: parkingLot.name,
						address: parkingLot.address,
						description: parkingLot.description,
						latitude: parkingLot.latitude,
						longitude: parkingLot.longitude,
						isActive: parkingLot.isActive,
						spaceStats: parkingLot.spaceStats,
					})),
			),
		);
	}
}
