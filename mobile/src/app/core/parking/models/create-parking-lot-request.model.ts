export interface CreateParkingLotRequest {
	name: string;
	address: string;
	description?: string;
	latitude: number;
	longitude: number;
}
