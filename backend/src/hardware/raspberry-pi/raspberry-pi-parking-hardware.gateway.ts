import { Injectable, Logger } from "@nestjs/common";

import { ParkingHardwareGateway } from "../gateways/parking-hardware.gateway.js";

import type { BarrierDirection } from "../models/barrier-direction.type.js";

@Injectable()
export class RaspberryPiParkingHardwareGateway extends ParkingHardwareGateway {
	private readonly logger = new Logger(RaspberryPiParkingHardwareGateway.name);

	async openBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void> {
		this.logger.log(
			`RPi: zahtev za otvaranje ${direction} rampe parkinga ${parkingLotId}.`,
		);

		/*
		 * H4:
		 * ovde će biti stvarna
		 * kontrola servo motora.
		 */
	}

	async closeBarrier(
		parkingLotId: string,
		direction: BarrierDirection,
	): Promise<void> {
		this.logger.log(
			`RPi: zahtev za zatvaranje ${direction} rampe parkinga ${parkingLotId}.`,
		);

		/*
		 * H4:
		 * ovde će biti stvarna
		 * kontrola servo motora.
		 */
	}

	async updateFreeSpacesDisplay(
		parkingLotId: string,
		freeSpaces: number,
	): Promise<void> {
		this.logger.log(
			`RPi: displej parkinga ${parkingLotId} treba da prikaže ${freeSpaces} slobodnih mesta.`,
		);

		/*
		 * H7:
		 * ovde će biti stvarna
		 * kontrola displeja.
		 */
	}
}
