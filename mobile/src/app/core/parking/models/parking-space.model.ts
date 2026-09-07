import {
    ParkingSpaceOccupancy,
} from './parking-space-occupancy.type';


export interface ParkingSpace {
    id: string;
    parkingLotId: string;
    code: string;
    occupancyStatus: ParkingSpaceOccupancy;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    parkingLot?: {
        id: string;
        name: string;
        address: string;
        isActive?: boolean;
    };
}