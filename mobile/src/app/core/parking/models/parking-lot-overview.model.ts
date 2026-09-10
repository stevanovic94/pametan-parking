import { ParkingLot } from "./parking-lot.model";

export interface ParkingLotOverview extends ParkingLot {
	spaceStats: {
		total: number;
		free: number;
		reserved: number;
		occupied: number;
		unknown: number;
	};
}
