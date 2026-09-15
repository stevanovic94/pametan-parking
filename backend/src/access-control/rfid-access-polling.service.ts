import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";

import {
  ParkingAccessResult,
  ParkingEventType,
} from "../generated/prisma/client.js";

import { RaspberryPiHardwareBridgeClient } from "../hardware/raspberry-pi/raspberry-pi-hardware-bridge.client.js";

import { PrismaService } from "../prisma/prisma.service.js";

import { AccessControlService } from "./access-control.service.js";

@Injectable()
export class RfidAccessPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RfidAccessPollingService.name);

  private timer: NodeJS.Timeout | null = null;

  private running = false;

  /*
   * Kartica sme da bude obrađena samo jednom
   * dok se fizički ne skloni sa čitača.
   */
  private armed = true;

  private parkingLotId = "";

  private intervalMs = 500;

  constructor(
    private readonly configService: ConfigService,

    private readonly prisma: PrismaService,

    private readonly accessControlService: AccessControlService,

    private readonly hardwareBridge: RaspberryPiHardwareBridgeClient,
  ) {}

  onModuleInit(): void {
    const enabled =
      this.configService
        .get<string>("RFID_ACCESS_ENABLED")
        ?.trim()
        .toLowerCase() === "true";

    if (!enabled) {
      this.logger.log("RFID kontrola pristupa je isključena.");

      return;
    }

    this.parkingLotId = (
      this.configService.get<string>("RFID_ACCESS_PARKING_LOT_ID") ??
      this.configService.get<string>("PARKING_SENSOR_PARKING_LOT_ID") ??
      ""
    ).trim();

    if (!this.parkingLotId) {
      this.logger.error("RFID_ACCESS_PARKING_LOT_ID nije podešen.");

      return;
    }

    const configuredInterval = Number(
      this.configService.get<string>("RFID_ACCESS_POLL_INTERVAL_MS") ?? "500",
    );

    if (Number.isFinite(configuredInterval)) {
      this.intervalMs = Math.max(300, configuredInterval);
    }

    this.logger.log(
      `RFID kontrola pokrenuta za parking ${this.parkingLotId}, interval ${this.intervalMs} ms.`,
    );

    this.timer = setInterval(() => {
      void this.poll();
    }, this.intervalMs);

    void this.poll();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);

      this.timer = null;
    }
  }

  private async poll(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const uid = await this.hardwareBridge.readNfcUid();

      /*
       * Nema kartice:
       * sledeće prislanjanje ponovo može
       * da pokrene kontrolu.
       */
      if (uid === null) {
        this.armed = true;

        return;
      }

      /*
       * Kartica je i dalje na čitaču.
       * Ne obrađujemo je ponovo.
       */
      if (!this.armed) {
        return;
      }

      this.armed = false;

      await this.processUid(uid);
    } catch (error) {
      this.logger.error(`RFID polling greška: ${this.errorMessage(error)}`);
    } finally {
      this.running = false;
    }
  }

  private async processUid(uid: string): Promise<void> {
    this.logger.log(`Očitana RFID kartica ${uid}.`);

    const user = await this.prisma.user.findUnique({
      where: {
        rfidUid: uid,
      },

      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    /*
     * UID nije dodeljen nijednom korisniku.
     * Nemamo userId pa ne kreiramo
     * ParkingEvent, samo odbijamo pristup.
     */
    if (!user) {
      this.logger.warn(`Nepoznata RFID kartica ${uid}.`);

      await this.signalResult(false);

      return;
    }

    try {
      const latestGrantedEvent = await this.prisma.parkingEvent.findFirst({
        where: {
          userId: user.id,

          parkingLotId: this.parkingLotId,

          result: ParkingAccessResult.GRANTED,
        },

        select: {
          type: true,
        },

        orderBy: [
          {
            occurredAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

      /*
       * Poslednji GRANTED je ENTRY:
       * korisnik je unutra -> EXIT.
       *
       * U svakom drugom slučaju:
       * pokušavamo ENTRY.
       */
      const isInside = latestGrantedEvent?.type === ParkingEventType.ENTRY;

      const decision = isInside
        ? await this.accessControlService.requestExit(
            user.id,
            this.parkingLotId,
          )
        : await this.accessControlService.requestEntry(
            user.id,
            this.parkingLotId,
          );

      await this.signalResult(decision.granted);

      this.logger.log(
        [
          `RFID ${uid}`,
          `korisnik=${user.email}`,
          `akcija=${isInside ? "EXIT" : "ENTRY"}`,
          `rezultat=${decision.granted ? "GRANTED" : "DENIED"}`,
          decision.reason ? `razlog=${decision.reason}` : "",
        ]
          .filter(Boolean)
          .join(", "),
      );
    } catch (error) {
      await this.signalResult(false);

      throw error;
    }
  }

  private async signalResult(granted: boolean): Promise<void> {
    try {
      await this.hardwareBridge.showAccessResult(granted);
    } catch (error) {
      this.logger.error(
        `LED indikacija nije uspela: ${this.errorMessage(error)}`,
      );
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
