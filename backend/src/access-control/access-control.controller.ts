import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import type { AuthenticatedRequest } from "../security/interfaces/authenticated-request.interface.js";
import { JwtAuthGuard } from "../security/guards/jwt-auth.guard.js";
import { AccessControlService } from "./access-control.service.js";
import { RequestEntryDto } from "./dto/request-entry.dto.js";
import { RequestExitDto } from "./dto/request-exit.dto.js";

@Controller("access-control")
@UseGuards(JwtAuthGuard)
export class AccessControlController {
	constructor(private readonly accessControlService: AccessControlService) {}

	@Post("entry")
	requestEntry(
		@Req()
		request: AuthenticatedRequest,

		@Body()
		dto: RequestEntryDto,
	) {
		return this.accessControlService.requestEntry(
			request.user.sub,
			dto.parkingLotId,
		);
	}

	@Post("exit")
	requestExit(
		@Req()
		request: AuthenticatedRequest,

		@Body()
		dto: RequestExitDto,
	) {
		return this.accessControlService.requestExit(
			request.user.sub,
			dto.parkingLotId,
		);
	}
}
