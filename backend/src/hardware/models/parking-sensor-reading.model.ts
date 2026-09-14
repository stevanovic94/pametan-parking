export type ParkingSensorOccupancy = "FREE" | "OCCUPIED" | "UNKNOWN";

export type ParkingSensorPosition = 1 | 2 | 3 | 4;

export interface ParkingSensorReading {
  position: ParkingSensorPosition;

  distanceMm: number | null;

  occupancyStatus: ParkingSensorOccupancy;
}