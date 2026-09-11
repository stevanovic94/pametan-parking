import type { BarrierDirection } from "./barrier-direction.type.js";

export type BarrierState = "OPEN" | "CLOSED";

export interface HardwareSimulationState {
	parkingLotId: string;

	barriers: Record<BarrierDirection, BarrierState>;

	freeSpaces: number | null;
}
