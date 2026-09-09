import { ParkingEvent } from "./parking-event.model";

export interface StaffParkingEvent extends ParkingEvent {
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: "USER" | "OPERATOR" | "ADMIN";
		isActive: boolean;
	};
}
