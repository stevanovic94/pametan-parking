import { Module } from "@nestjs/common";

import { ParkingLotsModule } from "../parking-lots/parking-lots.module.js";

import { PrismaModule } from "../prisma/prisma.module.js";

import { SecurityModule } from "../security/security.module.js";

import { ParkingSpacesController } from "./parking-spaces.controller.js";

import { ParkingSpacesService } from "./parking-spaces.service.js";

import { HardwareModule } from "../hardware/hardware.module.js";

import { ParkingSensorSyncService } from "./parking-sensor-sync.service.js";

@Module({
  imports: [PrismaModule, SecurityModule, ParkingLotsModule, HardwareModule, ParkingSensorSyncService],

  controllers: [ParkingSpacesController],

  providers: [ParkingSpacesService],

  exports: [ParkingSpacesService],
})
export class ParkingSpacesModule {}
