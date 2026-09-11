import { Injectable, Logger } from "@nestjs/common";

import { ParkingHardwareGateway } from "../gateways/parking-hardware.gateway.js";

import type { BarrierDirection } from "../models/barrier-direction.type.js";

import type { HardwareSimulationState } from "../models/hardware-simulation-state.model.js";

@Injectable()
export class SimulatedParkingHardwareGateway extends ParkingHardwareGateway {
	private readonly logger = new Logger(SimulatedParkingHardwareGateway.name);

	private readonly states = new Map<string, HardwareSimulationState>();

	async openBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void> {
		const state = this.getOrCreateState(parkingLotId);

		state.barriers[direction] = "OPEN";

		this.logger.log(
			`SIMULATOR: ${direction} rampa parkinga ${parkingLotId} je otvorena.`,
		);
	}

	async closeBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void> {
		const state = this.getOrCreateState(parkingLotId);

		state.barriers[direction] = "CLOSED";

		this.logger.log(
			`SIMULATOR: ${direction} rampa parkinga ${parkingLotId} je zatvorena.`,
		);
	}

	async updateFreeSpacesDisplay(
		parkingLotId: string,
		freeSpaces: number,
	): Promise<void> {
		const state = this.getOrCreateState(parkingLotId);

		state.freeSpaces = Math.max(0, Math.trunc(freeSpaces));

		this.logger.log(
			`SIMULATOR: displej parkinga ${parkingLotId} prikazuje ${state.freeSpaces} slobodnih mesta.`,
		);
	}

	getState(parkingLotId: string): HardwareSimulationState {
		const state = this.getOrCreateState(parkingLotId);

		return this.cloneState(state);
	}

	reset(parkingLotId?: string): void {
		if (parkingLotId) {
			this.states.delete(parkingLotId);

			return;
		}

		this.states.clear();
	}

	private getOrCreateState(parkingLotId: string): HardwareSimulationState {
		const existing = this.states.get(parkingLotId);

		if (existing) {
			return existing;
		}

		const state: HardwareSimulationState = {
			parkingLotId,

			barriers: {
				ENTRY: "CLOSED",
				EXIT: "CLOSED",
			},

			freeSpaces: null,
		};

		this.states.set(parkingLotId, state);

		return state;
	}

	private cloneState(state: HardwareSimulationState): HardwareSimulationState {
		return {
			parkingLotId: state.parkingLotId,

			barriers: {
				ENTRY: state.barriers.ENTRY,

				EXIT: state.barriers.EXIT,
			},

			freeSpaces: state.freeSpaces,
		};
	}
}
