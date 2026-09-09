import { provideHttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { MyParkingEventsPage } from "./my-parking-events.page";

describe("MyParkingEventsPage", () => {
	let component: MyParkingEventsPage;

	let fixture: ComponentFixture<MyParkingEventsPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MyParkingEventsPage],

			providers: [provideHttpClient(), provideRouter([])],
		}).compileComponents();

		fixture = TestBed.createComponent(MyParkingEventsPage);

		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
