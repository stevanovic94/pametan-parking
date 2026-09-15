import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  ParkingSensorOccupancy,
  ParkingSensorPosition,
  ParkingSensorReading,
} from '../models/parking-sensor-reading.model.js';

@Injectable()
export class RaspberryPiHardwareBridgeClient {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  constructor(
    configService: ConfigService,
  ) {
    this.baseUrl = (
      configService.get<string>(
        'HARDWARE_BRIDGE_URL',
      ) ??
      'http://127.0.0.1:8765'
    ).replace(/\/+$/, '');

    this.timeoutMs = Number(
      configService.get<string>(
        'HARDWARE_BRIDGE_TIMEOUT_MS',
      ) ??
      '2000',
    );
  }

  async readParkingSensors():
    Promise<ParkingSensorReading[]> {
    const response =
      await this.request(
        '/sensors',
      );

    const payload =
      (await response.json()) as {
        sensors?: unknown;
      };

    if (
      !Array.isArray(
        payload.sensors,
      )
    ) {
      throw new Error(
        'Hardware bridge nije vratio niz senzora.',
      );
    }

    const readings =
      payload.sensors.map(
        (value: unknown) =>
          this.parseReading(value),
      );

    if (
      readings.length !== 4
    ) {
      throw new Error(
        `Očekivana su 4 senzora, dobijeno ${readings.length}.`,
      );
    }

    return readings.sort(
      (
        first: ParkingSensorReading,
        second: ParkingSensorReading,
      ) =>
        first.position -
        second.position,
    );
  }

  async updateFreeSpacesDisplay(
    freeSpaces: number,
  ): Promise<void> {
    await this.request(
      '/display',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          freeSpaces,
        }),
      },
    );
  }

  async readNfcUid():
    Promise<string | null> {
    const response =
      await this.request(
        '/nfc',
      );

    const payload =
      (await response.json()) as {
        uid?: unknown;
      };

    if (
      payload.uid === null
    ) {
      return null;
    }

    if (
      typeof payload.uid !==
      'string'
    ) {
      throw new Error(
        'Hardware bridge je vratio neispravan NFC UID.',
      );
    }

    const uid =
      payload.uid
        .trim()
        .toUpperCase();

    if (
      uid.length === 0 ||
      uid.length % 2 !== 0 ||
      !/^[0-9A-F]+$/.test(uid)
    ) {
      throw new Error(
        'Hardware bridge je vratio neispravan format NFC UID-a.',
      );
    }

    return uid;
  }

  async showAccessResult(
    granted: boolean,
  ): Promise<void> {
    await this.request(
      '/access-indicator',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          granted,
        }),
      },
    );
  }

  private async request(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => {
          controller.abort();
        },
        this.timeoutMs,
      );

    try {
      const response =
        await fetch(
          `${this.baseUrl}${path}`,
          {
            ...init,

            signal:
              controller.signal,
          },
        );

      if (!response.ok) {
        throw new Error(
          `Hardware bridge HTTP ${response.status}.`,
        );
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseReading(
    value: unknown,
  ): ParkingSensorReading {
    if (
      typeof value !== 'object' ||
      value === null
    ) {
      throw new Error(
        'Neispravno očitavanje senzora.',
      );
    }

    const raw = value as {
      position?: unknown;
      distanceMm?: unknown;
      occupancyStatus?: unknown;
    };

    const position =
      Number(
        raw.position,
      );

    if (
      ![1, 2, 3, 4].includes(
        position,
      )
    ) {
      throw new Error(
        'Neispravna pozicija senzora.',
      );
    }

    const occupancyStatus =
      raw.occupancyStatus;

    if (
      occupancyStatus !== 'FREE' &&
      occupancyStatus !== 'OCCUPIED' &&
      occupancyStatus !== 'UNKNOWN'
    ) {
      throw new Error(
        'Neispravan status senzora.',
      );
    }

    const distanceMm =
      raw.distanceMm;

    if (
      distanceMm !== null &&
      (
        typeof distanceMm !==
          'number' ||
        !Number.isFinite(
          distanceMm,
        )
      )
    ) {
      throw new Error(
        'Neispravna udaljenost senzora.',
      );
    }

    return {
      position:
        position as ParkingSensorPosition,

      distanceMm:
        distanceMm as number | null,

      occupancyStatus:
        occupancyStatus as ParkingSensorOccupancy,
    };
  }
}