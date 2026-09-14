import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import { ParkingSensorSyncService } from "./parking-sensor-sync.service.js";

@Injectable()
export class ParkingSensorPollingService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ParkingSensorPollingService.name);

  private timer: NodeJS.Timeout | undefined;

  private running = false;

  constructor(
    private readonly configService: ConfigService,

    private readonly sensorSyncService: ParkingSensorSyncService,
  ) {}

  onModuleInit(): void {
    const enabled =
      this.configService
        .get<string>("PARKING_SENSOR_SYNC_ENABLED")
        ?.trim()
        .toLowerCase() === "true";

    if (!enabled) {
      this.logger.log("Automatsko očitavanje parking senzora nije uključeno.");

      return;
    }

    const parkingLotId = this.configService
      .get<string>("PARKING_SENSOR_PARKING_LOT_ID")
      ?.trim();

    if (!parkingLotId) {
      this.logger.warn("PARKING_SENSOR_PARKING_LOT_ID nije podešen.");

      return;
    }

    const configuredInterval = Number(
      this.configService.get<string>("PARKING_SENSOR_SYNC_INTERVAL_MS") ??
        "1000",
    );

    const intervalMs = Number.isFinite(configuredInterval)
      ? Math.max(500, configuredInterval)
      : 1000;

    const execute = async () => {
      if (this.running) {
        return;
      }

      this.running = true;

      try {
        await this.sensorSyncService.syncParkingLot(parkingLotId);
      } catch (error) {
        this.logger.error(
          "Očitavanje parking senzora nije uspelo.",
          error instanceof Error ? error.stack : undefined,
        );
      } finally {
        this.running = false;
      }
    };

    void execute();

    this.timer = setInterval(() => {
      void execute();
    }, intervalMs);

    this.logger.log(`Parking senzori se osvežavaju na ${intervalMs} ms.`);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
