import { Module } from "@nestjs/common";

import { ParkingHardwareGateway } from "./gateways/parking-hardware.gateway.js";

import { SimulatedParkingHardwareGateway } from "./simulators/simulated-parking-hardware.gateway.js";

@Module({
	providers: [
		SimulatedParkingHardwareGateway,

		{
			provide: ParkingHardwareGateway,

			useExisting: SimulatedParkingHardwareGateway,
		},
	],

	exports: [ParkingHardwareGateway, SimulatedParkingHardwareGateway],
})
export class HardwareModule {}
