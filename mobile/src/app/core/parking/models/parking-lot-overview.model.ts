import { ParkingLot } from './parking-lot.model';

export interface ParkingLotSpaceStats {
    total: number;
    free: number;
    occupied: number;
    unknown: number;
}

export interface ParkingLotOverview extends ParkingLot {
    spaceStats: ParkingLotSpaceStats;
}