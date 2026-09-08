import {
    IsIn,
    IsOptional,
    IsUUID,
} from 'class-validator';

export class ReservationsQueryDto {
    @IsOptional()
    @IsUUID()
    parkingLotId?: string;

    @IsOptional()
    @IsIn([
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
    ])
    status?:
        | 'CONFIRMED'
        | 'CANCELLED'
        | 'COMPLETED';
}