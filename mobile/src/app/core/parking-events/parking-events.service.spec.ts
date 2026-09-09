import { provideHttpClient } from "@angular/common/http";
import {
	HttpTestingController,
	provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { environment } from "../../../environments/environment";
import { ParkingEventsService } from "./parking-events.service";

describe("ParkingEventsService", () => {
	let service: ParkingEventsService;

	let httpTesting: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		service = TestBed.inject(ParkingEventsService);

		httpTesting = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTesting.verify();
	});

	it("should load authenticated user parking events", () => {
		service.getMine().subscribe();

		const request = httpTesting.expectOne(
			`${environment.apiUrl}/parking-events/my`,
		);

		expect(request.request.method).toBe("GET");

		request.flush([]);
	});
});
