import { ReservationStatus } from "../../reservations/models/reservation-status.type";
import { ParkingAccessResult } from "./parking-access-result.type";
import { ParkingEventType } from "./parking-event-type.type";

export interface ParkingEvent {
	id: string;
	userId: string;
	parkingLotId: string;
	reservationId: string | null;
	type: ParkingEventType;
	result: ParkingAccessResult;
	reason: string | null;
	occurredAt: string;
	createdAt: string;

	parkingLot: {
		id: string;
		name: string;
		address: string;
		isActive: boolean;
	};

	reservation: {
		id: string;
		startAt: string;
		endAt: string;
		status: ReservationStatus;

		parkingSpace: {
			id: string;
			code: string;
		};
	} | null;
}
