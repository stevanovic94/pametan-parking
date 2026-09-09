import { provideHttpClient } from "@angular/common/http";
import {
	HttpTestingController,
	provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { environment } from "../../../environments/environment";
import { ParkingOccupancyService } from "./parking-occupancy.service";

describe("ParkingOccupancyService", () => {
	let service: ParkingOccupancyService;

	let httpTesting: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		service = TestBed.inject(ParkingOccupancyService);

		httpTesting = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTesting.verify();
	});

	it("should load parking spaces", () => {
		service.getParkingSpaces("parking-1").subscribe();

		const request = httpTesting.expectOne(
			(req) =>
				req.url === `${environment.apiUrl}/parking-spaces` &&
				req.params.get("parkingLotId") === "parking-1",
		);

		expect(request.request.method).toBe("GET");

		request.flush([]);
	});

	it("should update parking space occupancy", () => {
		service.updateOccupancy("space-1", "OCCUPIED").subscribe();

		const request = httpTesting.expectOne(
			`${environment.apiUrl}/parking-spaces/space-1/occupancy`,
		);

		expect(request.request.method).toBe("PATCH");

		expect(request.request.body).toEqual({
			occupancyStatus: "OCCUPIED",
		});

		request.flush({
			id: "space-1",
			parkingLotId: "parking-1",
			code: "A1",
			occupancyStatus: "OCCUPIED",
			isActive: true,
			createdAt: "",
			updatedAt: "",
		});
	});
});
