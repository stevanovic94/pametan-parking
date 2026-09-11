import { Injectable, Logger } from "@nestjs/common";

import { ParkingHardwareGateway } from "../gateways/parking-hardware.gateway.js";

import type { BarrierDirection } from "../models/barrier-direction.type.js";

import type { HardwareSimulationState } from "../models/hardware-simulation-state.model.js";

@Injectable()
export class SimulatedParkingHardwareGateway extends ParkingHardwareGateway {
	private readonly logger = new Logger(SimulatedParkingHardwareGateway.name);

	private readonly barrierOpenDurationMs = 12_000;

	private readonly states = new Map<string, HardwareSimulationState>();

	private readonly barrierTimers = new Map<
		string,
		ReturnType<typeof setTimeout>
	>();

	async openBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void> {
		const state = this.getOrCreateState(parkingLotId);

		const timerKey = this.createBarrierTimerKey(parkingLotId, direction);

		const existingTimer = this.barrierTimers.get(timerKey);

		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		state.barriers[direction] = "OPEN";

		this.logger.log(
			`SIMULATOR: ${direction} rampa parkinga ${parkingLotId} je otvorena.`,
		);

		const timer = setTimeout(() => {
			void this.closeBarrier(parkingLotId, direction);
		}, this.barrierOpenDurationMs);

		this.barrierTimers.set(timerKey, timer);
	}

	async closeBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void> {
		const state = this.getOrCreateState(parkingLotId);

		const timerKey = this.createBarrierTimerKey(parkingLotId, direction);

		const existingTimer = this.barrierTimers.get(timerKey);

		if (existingTimer) {
			clearTimeout(existingTimer);

			this.barrierTimers.delete(timerKey);
		}

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
			this.clearParkingTimers(parkingLotId);

			this.states.delete(parkingLotId);

			return;
		}

		for (const timer of this.barrierTimers.values()) {
			clearTimeout(timer);
		}

		this.barrierTimers.clear();
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

	private createBarrierTimerKey(
		parkingLotId: string,
		direction: BarrierDirection,
	): string {
		return `${parkingLotId}:${direction}`;
	}

	private clearParkingTimers(parkingLotId: string): void {
		for (const direction of ["ENTRY", "EXIT"] as const) {
			const timerKey = this.createBarrierTimerKey(parkingLotId, direction);

			const timer = this.barrierTimers.get(timerKey);

			if (timer) {
				clearTimeout(timer);

				this.barrierTimers.delete(timerKey);
			}
		}
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
