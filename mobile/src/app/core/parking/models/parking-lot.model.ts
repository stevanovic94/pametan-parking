export interface ParkingLot {
    id: string;
    name: string;
    address: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}