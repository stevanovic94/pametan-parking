import { ReservationStatus } from "./reservation-status.type";

export interface StaffReservationsQuery {
	parkingLotId?: string;
	status?: ReservationStatus;
}
