import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from "class-validator";

export class CreateParkingLotDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	address!: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@IsNumber()
	@Min(-90)
	@Max(90)
	latitude!: number;

	@IsNumber()
	@Min(-180)
	@Max(180)
	longitude!: number;
}
