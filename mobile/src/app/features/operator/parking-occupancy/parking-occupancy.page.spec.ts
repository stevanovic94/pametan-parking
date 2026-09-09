import { provideHttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { ParkingOccupancyPage } from "./parking-occupancy.page";

describe("ParkingOccupancyPage", () => {
	let component: ParkingOccupancyPage;

	let fixture: ComponentFixture<ParkingOccupancyPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ParkingOccupancyPage],

			providers: [provideHttpClient(), provideRouter([])],
		}).compileComponents();

		fixture = TestBed.createComponent(ParkingOccupancyPage);

		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
