import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { SecurityModule } from "../security/security.module.js";
import { ParkingEventsController } from "./parking-events.controller.js";
import { ParkingEventsService } from "./parking-events.service.js";

@Module({
	imports: [PrismaModule, SecurityModule],

	controllers: [ParkingEventsController],

	providers: [ParkingEventsService],

	exports: [ParkingEventsService],
})
export class ParkingEventsModule {}
