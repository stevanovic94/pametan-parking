import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ParkingEvent } from "./models/parking-event.model";
import { StaffParkingEvent } from "./models/staff-parking-event.model";
import { StaffParkingEventsQuery } from "./models/staff-parking-events-query.model";

@Injectable({
	providedIn: "root",
})
export class ParkingEventsService {
	private readonly http = inject(HttpClient);

	private readonly apiUrl = environment.apiUrl;

	getMine(): Observable<ParkingEvent[]> {
		return this.http.get<ParkingEvent[]>(`${this.apiUrl}/parking-events/my`);
	}

	getAllForStaff(
		query: StaffParkingEventsQuery = {},
	): Observable<StaffParkingEvent[]> {
		let params = new HttpParams();

		if (query.parkingLotId) {
			params = params.set("parkingLotId", query.parkingLotId);
		}

		if (query.type) {
			params = params.set("type", query.type);
		}

		if (query.result) {
			params = params.set("result", query.result);
		}

		return this.http.get<StaffParkingEvent[]>(`${this.apiUrl}/parking-events`, {
			params,
		});
	}
}
