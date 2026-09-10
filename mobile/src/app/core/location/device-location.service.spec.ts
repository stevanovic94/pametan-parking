import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { DeviceLocationService } from "./device-location.service";

describe("DeviceLocationService", () => {
	let service: DeviceLocationService;

	beforeEach(() => {
		TestBed.configureTestingModule({});

		service = TestBed.inject(DeviceLocationService);
	});

	it("should calculate geographic distance", () => {
		const distance = service.calculateDistanceKm(0, 0, 0, 1);

		expect(distance).toBeCloseTo(111.2, 1);
	});

	it("should return zero for same location", () => {
		const distance = service.calculateDistanceKm(
			44.7721,
			20.4757,
			44.7721,
			20.4757,
		);

		expect(distance).toBeCloseTo(0, 5);
	});
});
