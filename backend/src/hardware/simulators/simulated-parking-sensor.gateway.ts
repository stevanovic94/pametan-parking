import { Injectable } from "@nestjs/common";

import { ParkingSensorGateway } from "../gateways/parking-sensor.gateway.js";

import type { ParkingSensorReading } from "../models/parking-sensor-reading.model.js";

@Injectable()
export class SimulatedParkingSensorGateway extends ParkingSensorGateway {
  private readonly readingsByParkingLot = new Map<
    string,
    ParkingSensorReading[]
  >();

  async readParkingSensors(
    parkingLotId: string,
  ): Promise<ParkingSensorReading[]> {
    const readings =
      this.readingsByParkingLot.get(parkingLotId) ??
      this.createDefaultReadings();

    return readings.map((reading) => ({
      ...reading,
    }));
  }

  setSensorReading(parkingLotId: string, reading: ParkingSensorReading): void {
    const current =
      this.readingsByParkingLot.get(parkingLotId) ??
      this.createDefaultReadings();

    const updated = current.map((item) =>
      item.position === reading.position
        ? {
            ...reading,
          }
        : item,
    );

    this.readingsByParkingLot.set(parkingLotId, updated);
  }

  resetParkingSensors(parkingLotId: string): void {
    this.readingsByParkingLot.delete(parkingLotId);
  }

  private createDefaultReadings(): ParkingSensorReading[] {
    return [
      {
        position: 1,
        distanceMm: 300,
        occupancyStatus: "FREE",
      },
      {
        position: 2,
        distanceMm: 300,
        occupancyStatus: "FREE",
      },
      {
        position: 3,
        distanceMm: 300,
        occupancyStatus: "FREE",
      },
      {
        position: 4,
        distanceMm: 300,
        occupancyStatus: "FREE",
      },
    ];
  }
}
