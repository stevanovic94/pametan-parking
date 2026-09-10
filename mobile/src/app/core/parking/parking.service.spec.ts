import { provideHttpClient } from "@angular/common/http";
import {
	HttpTestingController,
	provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { environment } from "../../../environments/environment";
import { ParkingService } from "./parking.service";

describe("ParkingService", () => {
	let service: ParkingService;

	let httpTesting: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		service = TestBed.inject(ParkingService);

		httpTesting = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTesting.verify();
	});

	it("should load ADMIN parking lots", () => {
		service.getAdminParkingLots().subscribe();

		const request = httpTesting.expectOne(
			`${environment.apiUrl}/parking-lots/admin`,
		);

		expect(request.request.method).toBe("GET");

		request.flush([]);
	});

	it("should create parking lot", () => {
		const body = {
			name: "Parking A",

			address: "Adresa A",

			description: "Test",

			latitude: 44.7721,

			longitude: 20.4757,
		};

		service.createParkingLot(body).subscribe();

		const request = httpTesting.expectOne(`${environment.apiUrl}/parking-lots`);

		expect(request.request.method).toBe("POST");

		expect(request.request.body).toEqual(body);

		request.flush({
			id: "parking-1",

			...body,

			isActive: true,

			createdAt: "",

			updatedAt: "",
		});
	});
});
