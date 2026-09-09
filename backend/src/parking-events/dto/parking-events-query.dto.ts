import { IsIn, IsOptional, IsUUID } from "class-validator";

export class ParkingEventsQueryDto {
	@IsOptional()
	@IsUUID()
	parkingLotId?: string;

	@IsOptional()
	@IsIn(["ENTRY", "EXIT"])
	type?: "ENTRY" | "EXIT";

	@IsOptional()
	@IsIn(["GRANTED", "DENIED"])
	result?: "GRANTED" | "DENIED";
}
