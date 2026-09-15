import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

import {
  ConfigService,
} from "@nestjs/config";

import {
  ParkingAccessResult,
  ParkingEventType,
} from "../generated/prisma/client.js";

import {
  RaspberryPiHardwareBridgeClient,
} from "../hardware/raspberry-pi/raspberry-pi-hardware-bridge.client.js";

import {
  PrismaService,
} from "../prisma/prisma.service.js";

import {
  AccessControlService,
} from "./access-control.service.js";


@Injectable()
export class RfidAccessPollingService
  implements
    OnModuleInit,
    OnModuleDestroy {

  private readonly logger =
    new Logger(
      RfidAccessPollingService.name,
    );


  private timer:
    ReturnType<typeof setInterval> |
    null =
      null;


  private running =
    false;


  private enabled =
    false;


  private parkingLotId:
    string | null =
      null;


  private intervalMs =
    500;


  /*
   * Kartica se obrađuje samo jednom
   * dok se ne ukloni sa čitača.
   */
  private armed =
    true;


  /*
   * Zahtevamo više uzastopnih očitavanja
   * "nema kartice" pre ponovnog armiranja.
   *
   * Sa intervalom od 500 ms:
   * 4 čitanja ~= 2 sekunde.
   */
  private consecutiveNoCardReads =
    0;


  private readonly requiredNoCardReads =
    4;


  constructor(
    private readonly configService:
      ConfigService,

    private readonly prisma:
      PrismaService,

    private readonly hardwareBridge:
      RaspberryPiHardwareBridgeClient,

    private readonly accessControlService:
      AccessControlService,
  ) {}


  onModuleInit(): void {

    const enabledValue =
      this.configService
        .get<string>(
          "RFID_ACCESS_ENABLED",
        )
        ?.trim()
        .toLowerCase();


    this.enabled =
      enabledValue === "true";


    if (!this.enabled) {

      this.logger.log(
        "RFID kontrola pristupa je isključena.",
      );

      return;
    }


    const configuredParkingLotId =
      this.configService
        .get<string>(
          "RFID_ACCESS_PARKING_LOT_ID",
        )
        ?.trim();


    const sensorParkingLotId =
      this.configService
        .get<string>(
          "PARKING_SENSOR_PARKING_LOT_ID",
        )
        ?.trim();


    this.parkingLotId =
      configuredParkingLotId ||
      sensorParkingLotId ||
      null;


    if (!this.parkingLotId) {

      this.logger.warn(
        "RFID kontrola nije pokrenuta jer parkingLotId nije podešen.",
      );

      this.enabled =
        false;

      return;
    }


    const rawInterval =
      Number(
        this.configService
          .get<string>(
            "RFID_ACCESS_POLL_INTERVAL_MS",
          ) ??
        "500",
      );


    if (
      Number.isFinite(rawInterval) &&
      rawInterval >= 300
    ) {

      this.intervalMs =
        Math.floor(
          rawInterval,
        );
    }


    this.timer =
      setInterval(
        () => {
          void this.poll();
        },
        this.intervalMs,
      );


    this.logger.log(
      `RFID kontrola pokrenuta za parking ${this.parkingLotId}, interval ${this.intervalMs} ms.`,
    );
  }


  onModuleDestroy(): void {

    if (this.timer) {

      clearInterval(
        this.timer,
      );

      this.timer =
        null;
    }
  }


  private async poll():
    Promise<void> {

    if (
      !this.enabled ||
      !this.parkingLotId ||
      this.running
    ) {

      return;
    }


    this.running =
      true;


    try {

      const uid =
        await this.hardwareBridge
          .readNfcUid();


      /*
       * Nema kartice.
       *
       * Ne armiramo sistem odmah,
       * već tek posle 4 uzastopna
       * prazna očitavanja.
       */
      if (uid === null) {

        this.consecutiveNoCardReads +=
          1;


        if (
          this.consecutiveNoCardReads >=
          this.requiredNoCardReads
        ) {

          this.armed =
            true;
        }


        return;
      }


      /*
       * Kartica je trenutno očitana.
       */
      this.consecutiveNoCardReads =
        0;


      /*
       * Ako je kartica već obrađena
       * i još nije pouzdano uklonjena,
       * ignorišemo novo očitavanje.
       */
      if (!this.armed) {

        return;
      }


      this.armed =
        false;


      this.logger.log(
        `Očitana RFID kartica ${uid}.`,
      );


      await this.processUid(
        uid,
        this.parkingLotId,
      );

    } catch (error) {

      /*
       * U slučaju neočekivane greške
       * signalizujemo odbijen pristup.
       */
      await this.signalResult(
        false,
      );


      this.logger.error(
        `Greška RFID kontrole: ${this.errorMessage(error)}`,
      );

    } finally {

      this.running =
        false;
    }
  }


  private async processUid(
    uid: string,
    parkingLotId: string,
  ): Promise<void> {

    const user =
      await this.prisma.user
        .findUnique({

          where: {

            rfidUid:
              uid,
          },

          select: {

            id: true,

            email: true,

            isActive: true,
          },
        });


    /*
     * Nepoznata kartica:
     * nema ParkingEvent-a jer nemamo userId.
     */
    if (!user) {

      await this.signalResult(
        false,
      );


      this.logger.warn(
        `RFID ${uid}, korisnik nije pronađen, rezultat=DENIED`,
      );


      return;
    }


    /*
     * Na osnovu poslednjeg GRANTED događaja
     * određujemo da li kartica znači
     * ENTRY ili EXIT.
     */
    const latestGrantedEvent =
      await this.prisma
        .parkingEvent
        .findFirst({

          where: {

            userId:
              user.id,

            parkingLotId,

            result:
              ParkingAccessResult.GRANTED,
          },

          select: {

            type: true,
          },

          orderBy: [
            {
              occurredAt:
                "desc",
            },
            {
              createdAt:
                "desc",
            },
          ],
        });


    const isInside =
      latestGrantedEvent?.type ===
      ParkingEventType.ENTRY;


    const action =
      isInside
        ? "EXIT"
        : "ENTRY";


    const decision =
      isInside
        ? await this
            .accessControlService
            .requestExit(
              user.id,
              parkingLotId,
            )

        : await this
            .accessControlService
            .requestEntry(
              user.id,
              parkingLotId,
            );


    await this.signalResult(
      decision.granted,
    );


    const reason =
      decision.reason
        ? `, razlog=${decision.reason}`
        : "";


    this.logger.log(
      `RFID ${uid}, korisnik=${user.email}, akcija=${action}, rezultat=${decision.granted ? "GRANTED" : "DENIED"}${reason}`,
    );
  }


  private async signalResult(
    granted: boolean,
  ): Promise<void> {

    try {

      await this.hardwareBridge
        .showAccessResult(
          granted,
        );

    } catch (error) {

      /*
       * Greška LED signalizacije ne sme
       * da poništi već donetu odluku
       * o pristupu.
       */
      this.logger.error(
        `LED signalizacija nije uspela: ${this.errorMessage(error)}`,
      );
    }
  }


  private errorMessage(
    error: unknown,
  ): string {

    if (
      error instanceof Error
    ) {

      return error.message;
    }


    return String(
      error,
    );
  }
}