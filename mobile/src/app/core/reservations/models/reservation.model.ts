import { ParkingSpaceOccupancy } from '../../parking/models/parking-space-occupancy.type';
import { ReservationStatus } from './reservation-status.type';

export interface Reservation {
    id: string;
    userId: string;
    parkingSpaceId: string;
    startAt: string;
    endAt: string;
    status: ReservationStatus;
    createdAt: string;
    updatedAt: string;

    parkingSpace: {
        id: string;
        code: string;
        occupancyStatus: ParkingSpaceOccupancy;

        parkingLot: {
            id: string;
            name: string;
            address: string;
            isActive?: boolean;
        };
    };
}