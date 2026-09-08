import { IsUUID } from "class-validator";

export class RequestExitDto {
	@IsUUID()
	parkingLotId!: string;
}
