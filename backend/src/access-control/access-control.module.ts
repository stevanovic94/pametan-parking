import { Module } from "@nestjs/common";

import { HardwareModule } from "../hardware/hardware.module.js";

import { PrismaModule } from "../prisma/prisma.module.js";

import { SecurityModule } from "../security/security.module.js";

import { AccessControlController } from "./access-control.controller.js";

import { AccessControlService } from "./access-control.service.js";

@Module({
	imports: [PrismaModule, SecurityModule, HardwareModule],

	controllers: [AccessControlController],

	providers: [AccessControlService],

	exports: [AccessControlService],
})
export class AccessControlModule {}
