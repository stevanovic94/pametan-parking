import { ParkingAccessResult } from "./parking-access-result.type";
import { ParkingEventType } from "./parking-event-type.type";

export interface StaffParkingEventsQuery {
	parkingLotId?: string;
	type?: ParkingEventType;
	result?: ParkingAccessResult;
}
