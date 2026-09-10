export interface ParkingMapLocation {
	id: string;
	name: string;
	address: string;
	description: string | null;
	latitude: number;
	longitude: number;
	isActive: boolean;

	spaceStats: {
		total: number;
		free: number;
		reserved: number;
		occupied: number;
		unknown: number;
	};
}
