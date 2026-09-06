import {
    IsEnum,
} from 'class-validator';

import {
    ParkingSpaceOccupancy,
} from '../../generated/prisma/client.js';


export class UpdateOccupancyDto {

    @IsEnum(ParkingSpaceOccupancy)
    occupancyStatus!: ParkingSpaceOccupancy;
}