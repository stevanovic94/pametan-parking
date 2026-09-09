import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ParkingSpaceOccupancy } from "./models/parking-space-occupancy.type";
import { ParkingSpace } from "./models/parking-space.model";

@Injectable({
	providedIn: "root",
})
export class ParkingOccupancyService {
	private readonly http = inject(HttpClient);

	private readonly apiUrl = environment.apiUrl;

	getParkingSpaces(parkingLotId: string): Observable<ParkingSpace[]> {
		const params = new HttpParams().set("parkingLotId", parkingLotId);

		return this.http.get<ParkingSpace[]>(`${this.apiUrl}/parking-spaces`, {
			params,
		});
	}

	updateOccupancy(
		parkingSpaceId: string,
		occupancyStatus: ParkingSpaceOccupancy,
	): Observable<ParkingSpace> {
		return this.http.patch<ParkingSpace>(
			`${this.apiUrl}/parking-spaces/${parkingSpaceId}/occupancy`,
			{
				occupancyStatus,
			},
		);
	}
}
