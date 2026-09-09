import { Reservation } from "./reservation.model";

export interface StaffReservation extends Reservation {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: "USER" | "OPERATOR" | "ADMIN";
	};
}
