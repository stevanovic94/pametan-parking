import { Injectable, Logger } from "@nestjs/common";

import { ParkingSensorGateway } from "../gateways/parking-sensor.gateway.js";

import type { ParkingSensorReading } from "../models/parking-sensor-reading.model.js";

import { RaspberryPiHardwareBridgeClient } from "./raspberry-pi-hardware-bridge.client.js";

@Injectable()
export class RaspberryPiParkingSensorGateway extends ParkingSensorGateway {
  private readonly logger = new Logger(RaspberryPiParkingSensorGateway.name);

  constructor(private readonly bridge: RaspberryPiHardwareBridgeClient) {
    super();
  }

  async readParkingSensors(
    parkingLotId: string,
  ): Promise<ParkingSensorReading[]> {
    try {
      return await this.bridge.readParkingSensors();
    } catch (error) {
      this.logger.error(
        `Očitavanje senzora parkinga ${parkingLotId} nije uspelo.`,
        error instanceof Error ? error.stack : undefined,
      );

      return [1, 2, 3, 4].map((position) => ({
        position: position as 1 | 2 | 3 | 4,

        distanceMm: null,

        occupancyStatus: "UNKNOWN" as const,
      }));
    }
  }
}
