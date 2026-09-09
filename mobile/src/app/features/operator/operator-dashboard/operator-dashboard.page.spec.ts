import { provideHttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { StaffReservationsPage } from "../staff-reservations/staff-reservations.page";

describe("StaffReservationsPage", () => {
	let component: StaffReservationsPage;

	let fixture: ComponentFixture<StaffReservationsPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StaffReservationsPage],

			providers: [provideHttpClient(), provideRouter([])],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffReservationsPage);

		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
