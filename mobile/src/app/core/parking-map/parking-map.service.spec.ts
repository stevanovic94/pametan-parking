import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ParkingLotOverview } from "../parking/models/parking-lot-overview.model";
import { ParkingService } from "../parking/parking.service";
import { ParkingMapService } from "./parking-map.service";

describe("ParkingMapService", () => {
	let service: ParkingMapService;

	const parkingServiceMock = {
		getParkingMapOverview: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		TestBed.configureTestingModule({
			providers: [
				ParkingMapService,
				{
					provide: ParkingService,
					useValue: parkingServiceMock,
				},
			],
		});

		service = TestBed.inject(ParkingMapService);
	});

	it("should return active and inactive parking lots with coordinates", () => {
		const parkingLots: ParkingLotOverview[] = [
			{
				id: "parking-1",
				name: "Parking 1",
				address: "Ulica 1",
				description: "Aktivan parking",
				latitude: 44.7721,
				longitude: 20.4757,
				isActive: true,
				createdAt: "",
				updatedAt: "",
				spaceStats: {
					total: 10,
					free: 4,
					reserved: 1,
					occupied: 4,
					unknown: 1,
				},
			},
			{
				id: "parking-2",
				name: "Parking 2",
				address: "Ulica 2",
				description: "Deaktiviran parking",
				latitude: 44.78,
				longitude: 20.48,
				isActive: false,
				createdAt: "",
				updatedAt: "",
				spaceStats: {
					total: 5,
					free: 0,
					reserved: 0,
					occupied: 5,
					unknown: 0,
				},
			},
			{
				id: "parking-3",
				name: "Parking 3",
				address: "Ulica 3",
				description: null,
				latitude: null,
				longitude: null,
				isActive: false,
				createdAt: "",
				updatedAt: "",
				spaceStats: {
					total: 3,
					free: 3,
					reserved: 0,
					occupied: 0,
					unknown: 0,
				},
			},
		];

		parkingServiceMock.getParkingMapOverview.mockReturnValue(of(parkingLots));

		service.getMapLocations().subscribe((parkingLocations) => {
			expect(parkingLocations.length).toBe(2);

			expect(parkingLocations[0]).toEqual({
				id: "parking-1",
				name: "Parking 1",
				address: "Ulica 1",
				description: "Aktivan parking",
				latitude: 44.7721,
				longitude: 20.4757,
				isActive: true,
				spaceStats: {
					total: 10,
					free: 4,
					reserved: 1,
					occupied: 4,
					unknown: 1,
				},
			});

			expect(parkingLocations[1].isActive).toBe(false);
		});
	});

	it("should accept zero as valid coordinate", () => {
		const parkingLots: ParkingLotOverview[] = [
			{
				id: "parking-1",
				name: "Parking 1",
				address: "Ekvator",
				description: null,
				latitude: 0,
				longitude: 0,
				isActive: true,
				createdAt: "",
				updatedAt: "",
				spaceStats: {
					total: 1,
					free: 1,
					reserved: 0,
					occupied: 0,
					unknown: 0,
				},
			},
		];

		parkingServiceMock.getParkingMapOverview.mockReturnValue(of(parkingLots));

		service.getMapLocations().subscribe((parkingLocations) => {
			expect(parkingLocations[0].latitude).toBe(0);

			expect(parkingLocations[0].longitude).toBe(0);
		});
	});
});
