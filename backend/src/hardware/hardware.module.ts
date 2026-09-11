import { Module } from "@nestjs/common";

import { ConfigModule, ConfigService } from "@nestjs/config";

import { ParkingHardwareGateway } from "./gateways/parking-hardware.gateway.js";

import { RaspberryPiParkingHardwareGateway } from "./raspberry-pi/raspberry-pi-parking-hardware.gateway.js";

import { SimulatedParkingHardwareGateway } from "./simulators/simulated-parking-hardware.gateway.js";

@Module({
	imports: [ConfigModule],

	providers: [
		SimulatedParkingHardwareGateway,
		RaspberryPiParkingHardwareGateway,

		{
			provide: ParkingHardwareGateway,

			inject: [
				ConfigService,
				SimulatedParkingHardwareGateway,
				RaspberryPiParkingHardwareGateway,
			],

			useFactory: (
				configService: ConfigService,

				simulator: SimulatedParkingHardwareGateway,

				raspberryPi: RaspberryPiParkingHardwareGateway,
			): ParkingHardwareGateway => {
				const hardwareMode = configService
					.get<string>("HARDWARE_MODE")
					?.trim()
					.toUpperCase();

				if (hardwareMode === "RASPBERRY_PI") {
					return raspberryPi;
				}

				return simulator;
			},
		},
	],

	exports: [
		ParkingHardwareGateway,

		SimulatedParkingHardwareGateway,
	],
})
export class HardwareModule {}
