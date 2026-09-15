import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";

import { HardwareModule } from "../hardware/hardware.module.js";

import { PrismaModule } from "../prisma/prisma.module.js";

import { SecurityModule } from "../security/security.module.js";

import { AccessControlController } from "./access-control.controller.js";

import { AccessControlService } from "./access-control.service.js";

import { RfidAccessPollingService } from "./rfid-access-polling.service.js";

@Module({
  imports: [ConfigModule, PrismaModule, SecurityModule, HardwareModule],

  controllers: [AccessControlController],

  providers: [AccessControlService, RfidAccessPollingService],

  exports: [AccessControlService],
})
export class AccessControlModule {}
