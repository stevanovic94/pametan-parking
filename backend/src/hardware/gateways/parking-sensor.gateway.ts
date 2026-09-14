import type { ParkingSensorReading } from "../models/parking-sensor-reading.model.js";

export abstract class ParkingSensorGateway {
  abstract readParkingSensors(
    parkingLotId: string,
  ): Promise<ParkingSensorReading[]>;
}
