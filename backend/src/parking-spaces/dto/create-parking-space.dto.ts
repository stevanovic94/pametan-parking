import {
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';


export class CreateParkingSpaceDto {

    @IsUUID()
    parkingLotId!: string;


    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    code!: string;
}