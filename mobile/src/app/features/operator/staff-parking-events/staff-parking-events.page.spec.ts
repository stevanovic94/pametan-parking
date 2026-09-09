import { provideHttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { StaffParkingEventsPage } from "./staff-parking-events.page";

describe("StaffParkingEventsPage", () => {
	let component: StaffParkingEventsPage;

	let fixture: ComponentFixture<StaffParkingEventsPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StaffParkingEventsPage],

			providers: [provideHttpClient(), provideRouter([])],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffParkingEventsPage);

		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
