import { IsISO8601, IsUUID } from 'class-validator';

export class CreateReservationDto {
    @IsUUID()
    parkingSpaceId!: string;

    @IsISO8601({ strict: true })
    startAt!: string;

    @IsISO8601({ strict: true })
    endAt!: string;
}