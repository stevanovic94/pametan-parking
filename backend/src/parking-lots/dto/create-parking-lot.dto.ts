import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';


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
}