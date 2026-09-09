import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ParkingEvent } from "./models/parking-event.model";

@Injectable({
	providedIn: "root",
})
export class ParkingEventsService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = environment.apiUrl;

	getMine(): Observable<ParkingEvent[]> {
		return this.http.get<ParkingEvent[]>(`${this.apiUrl}/parking-events/my`);
	}
}
