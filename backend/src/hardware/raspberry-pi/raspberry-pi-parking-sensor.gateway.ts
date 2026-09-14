import { Injectable, Logger } from "@nestjs/common";

import { ParkingSensorGateway } from "../gateways/parking-sensor.gateway.js";

import type { ParkingSensorReading } from "../models/parking-sensor-reading.model.js";

@Injectable()
export class RaspberryPiParkingSensorGateway extends ParkingSensorGateway {
  private readonly logger = new Logger(RaspberryPiParkingSensorGateway.name);

  async readParkingSensors(
    parkingLotId: string,
  ): Promise<ParkingSensorReading[]> {
    this.logger.debug(
      `RPi: zahtev za očitavanje senzora parkinga ${parkingLotId}.`,
    );

    return [
      {
        position: 1,
        distanceMm: null,
        occupancyStatus: "UNKNOWN",
      },
      {
        position: 2,
        distanceMm: null,
        occupancyStatus: "UNKNOWN",
      },
      {
        position: 3,
        distanceMm: null,
        occupancyStatus: "UNKNOWN",
      },
      {
        position: 4,
        distanceMm: null,
        occupancyStatus: "UNKNOWN",
      },
    ];
  }
}
