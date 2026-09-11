import type { BarrierDirection } from "../models/barrier-direction.type.js";

export abstract class ParkingHardwareGateway {
	abstract openBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void>;

	abstract closeBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void>;

	abstract updateFreeSpacesDisplay(
		parkingLotId: string,
		freeSpaces: number,
	): Promise<void>;
}
