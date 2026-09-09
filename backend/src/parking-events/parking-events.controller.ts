import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { AuthenticatedRequest } from "../security/interfaces/authenticated-request.interface.js";
import { Roles } from "../security/decorators/roles.decorator.js";
import { JwtAuthGuard } from "../security/guards/jwt-auth.guard.js";
import { RolesGuard } from "../security/guards/roles.guard.js";
import { ParkingEventsQueryDto } from "./dto/parking-events-query.dto.js";
import { ParkingEventsService } from "./parking-events.service.js";

@Controller("parking-events")
@UseGuards(JwtAuthGuard)
export class ParkingEventsController {
	constructor(private readonly parkingEventsService: ParkingEventsService) {}

	@Get("my")
	findMine(
		@Req()
		request: AuthenticatedRequest,
	) {
		return this.parkingEventsService.findMine(request.user.sub);
	}

	@Get()
	@UseGuards(RolesGuard)
	@Roles("OPERATOR", "ADMIN")
	findAllForStaff(
		@Query()
		query: ParkingEventsQueryDto,
	) {
		return this.parkingEventsService.findAllForStaff(query);
	}
}
