import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { ParkingSpaceGridComponent } from "./parking-space-grid.component";

describe("ParkingSpaceGridComponent", () => {
	let component: ParkingSpaceGridComponent;

	let fixture: ComponentFixture<ParkingSpaceGridComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ParkingSpaceGridComponent],

			providers: [provideRouter([])],
		}).compileComponents();

		fixture = TestBed.createComponent(ParkingSpaceGridComponent);

		component = fixture.componentInstance;

		component.parkingSpaces = [];

		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
