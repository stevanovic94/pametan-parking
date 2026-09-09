import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { CreateReservationRequest } from "./models/create-reservation-request.model";
import { Reservation } from "./models/reservation.model";
import { StaffReservation } from "./models/staff-reservation.model";
import { StaffReservationsQuery } from "./models/staff-reservations-query.model";

@Injectable({
	providedIn: "root",
})
export class ReservationService {
	private readonly http = inject(HttpClient);

	private readonly apiUrl = environment.apiUrl;

	create(request: CreateReservationRequest): Observable<Reservation> {
		return this.http.post<Reservation>(`${this.apiUrl}/reservations`, request);
	}

	getMine(): Observable<Reservation[]> {
		return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/my`);
	}

	cancel(id: string): Observable<Reservation> {
		return this.http.patch<Reservation>(
			`${this.apiUrl}/reservations/${id}/cancel`,
			{},
		);
	}

	getAllForStaff(
		query: StaffReservationsQuery = {},
	): Observable<StaffReservation[]> {
		let params = new HttpParams();

		if (query.parkingLotId) {
			params = params.set("parkingLotId", query.parkingLotId);
		}

		if (query.status) {
			params = params.set("status", query.status);
		}

		return this.http.get<StaffReservation[]>(`${this.apiUrl}/reservations`, {
			params,
		});
	}
}
