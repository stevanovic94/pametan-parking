import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ParkingMapService } from "../../../core/parking-map/parking-map.service";
import { ParkingMapPage } from "./parking-map.page";

describe("ParkingMapPage", () => {
	let component: ParkingMapPage;

	let fixture: ComponentFixture<ParkingMapPage>;

	const parkingMapServiceMock = {
		getMapLocations: vi.fn(() => of([])),
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		await TestBed.configureTestingModule({
			imports: [ParkingMapPage],

			providers: [
				provideRouter([]),

				{
					provide: ParkingMapService,

					useValue: parkingMapServiceMock,
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ParkingMapPage);

		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
