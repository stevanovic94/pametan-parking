import {
  IsOptional,
  IsUUID,
} from 'class-validator';


export class ParkingSpacesQueryDto {

  @IsOptional()
  @IsUUID()
  parkingLotId?: string;
}