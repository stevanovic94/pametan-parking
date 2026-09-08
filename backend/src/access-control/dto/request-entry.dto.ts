import { IsUUID } from "class-validator";

export class RequestEntryDto {
	@IsUUID()
	parkingLotId!: string;
}
