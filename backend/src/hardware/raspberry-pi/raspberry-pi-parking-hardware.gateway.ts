import { Injectable, Logger } from "@nestjs/common";

import { ParkingHardwareGateway } from "../gateways/parking-hardware.gateway.js";

import type { BarrierDirection } from "../models/barrier-direction.type.js";

import { RaspberryPiHardwareBridgeClient } from "./raspberry-pi-hardware-bridge.client.js";

@Injectable()
export class RaspberryPiParkingHardwareGateway extends ParkingHardwareGateway {
  constructor(private readonly bridge: RaspberryPiHardwareBridgeClient) {
    super();
  }

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
    try {
      await this.bridge.updateFreeSpacesDisplay(freeSpaces);

      this.logger.debug(
        `RPi: displej parkinga ${parkingLotId} prikazuje ${freeSpaces}.`,
      );
    } catch (error) {
      this.logger.error(
        `RPi: ažuriranje displeja parkinga ${parkingLotId} nije uspelo.`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
