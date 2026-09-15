import { Module } from "@nestjs/common";

import { ConfigModule, ConfigService } from "@nestjs/config";

import { ParkingHardwareGateway } from "./gateways/parking-hardware.gateway.js";

import { ParkingSensorGateway } from "./gateways/parking-sensor.gateway.js";

import { RaspberryPiParkingHardwareGateway } from "./raspberry-pi/raspberry-pi-parking-hardware.gateway.js";

import { RaspberryPiParkingSensorGateway } from "./raspberry-pi/raspberry-pi-parking-sensor.gateway.js";

import { SimulatedParkingHardwareGateway } from "./simulators/simulated-parking-hardware.gateway.js";

import { SimulatedParkingSensorGateway } from "./simulators/simulated-parking-sensor.gateway.js";

import { RaspberryPiHardwareBridgeClient } from "./raspberry-pi/raspberry-pi-hardware-bridge.client.js";

@Module({
  imports: [ConfigModule],

  providers: [
    SimulatedParkingHardwareGateway,
    RaspberryPiParkingHardwareGateway,

    SimulatedParkingSensorGateway,
    RaspberryPiParkingSensorGateway,
    RaspberryPiHardwareBridgeClient,

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

    {
      provide: ParkingSensorGateway,

      inject: [
        ConfigService,
        SimulatedParkingSensorGateway,
        RaspberryPiParkingSensorGateway,
      ],

      useFactory: (
        configService: ConfigService,

        simulator: SimulatedParkingSensorGateway,

        raspberryPi: RaspberryPiParkingSensorGateway,
      ): ParkingSensorGateway => {
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
    ParkingSensorGateway,
    RaspberryPiHardwareBridgeClient,

    SimulatedParkingHardwareGateway,
    SimulatedParkingSensorGateway,
  ],
})
export class HardwareModule {}
