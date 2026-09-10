export interface ParkingLot {
	id: string;
	name: string;
	address: string;
	description: string | null;
	latitude: number | null;
	longitude: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
