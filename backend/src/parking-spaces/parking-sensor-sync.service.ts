import { Injectable, Logger } from "@nestjs/common";

import {
  ParkingSpaceOccupancy,
  ReservationStatus,
} from "../generated/prisma/enums.js";

import { ParkingHardwareGateway } from "../hardware/gateways/parking-hardware.gateway.js";

import { ParkingSensorGateway } from "../hardware/gateways/parking-sensor.gateway.js";

import type { ParkingSensorReading } from "../hardware/models/parking-sensor-reading.model.js";

import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class ParkingSensorSyncService {
  private readonly logger = new Logger(ParkingSensorSyncService.name);

  constructor(
    private readonly prisma: PrismaService,

    private readonly parkingSensorGateway: ParkingSensorGateway,

    private readonly parkingHardwareGateway: ParkingHardwareGateway,
  ) {}

  async syncParkingLot(parkingLotId: string) {
    const readings =
      await this.parkingSensorGateway.readParkingSensors(parkingLotId);

    const parkingSpaces = await this.prisma.parkingSpace.findMany({
      where: {
        parkingLotId,
        isActive: true,

        parkingLot: {
          is: {
            isActive: true,
          },
        },
      },

      select: {
        id: true,
        code: true,
        occupancyStatus: true,
      },

      orderBy: {
        code: "asc",
      },
    });

    const sortedReadings = [...readings].sort(
      (first, second) => first.position - second.position,
    );

    if (parkingSpaces.length !== sortedReadings.length) {
      throw new Error(
        `Broj aktivnih parking mesta (${parkingSpaces.length}) ` +
          `ne odgovara broju senzora (${sortedReadings.length}) ` +
          `za parking ${parkingLotId}.`,
      );
    }

    const updates = parkingSpaces.flatMap((parkingSpace, index) => {
      const reading = sortedReadings[index];

      const occupancyStatus = this.mapOccupancyStatus(reading);

      if (parkingSpace.occupancyStatus === occupancyStatus) {
        return [];
      }

      this.logger.log(
        `Parking mesto ${parkingSpace.code}: ` +
          `${parkingSpace.occupancyStatus} -> ` +
          `${occupancyStatus}.`,
      );

      return [
        this.prisma.parkingSpace.update({
          where: {
            id: parkingSpace.id,
          },

          data: {
            occupancyStatus,
          },
        }),
      ];
    });

    if (updates.length > 0) {
      await this.prisma.$transaction(updates);
    }

    const now = new Date();

    const freeSpaces = await this.prisma.parkingSpace.count({
      where: {
        parkingLotId,
        isActive: true,

        occupancyStatus: ParkingSpaceOccupancy.FREE,

        parkingLot: {
          is: {
            isActive: true,
          },
        },

        reservations: {
          none: {
            status: ReservationStatus.CONFIRMED,

            startAt: {
              lte: now,
            },

            endAt: {
              gt: now,
            },
          },
        },
      },
    });

    await this.parkingHardwareGateway.updateFreeSpacesDisplay(
      parkingLotId,
      freeSpaces,
    );

    return {
      parkingLotId,

      sensors: sortedReadings,

      updatedSpaces: updates.length,

      freeSpaces,
    };
  }

  private mapOccupancyStatus(reading: ParkingSensorReading) {
    switch (reading.occupancyStatus) {
      case "FREE":
        return ParkingSpaceOccupancy.FREE;

      case "OCCUPIED":
        return ParkingSpaceOccupancy.OCCUPIED;

      case "UNKNOWN":
        return ParkingSpaceOccupancy.UNKNOWN;
    }
  }
}
