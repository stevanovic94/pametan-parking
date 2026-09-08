import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ParkingAccessResult,
	ParkingEventType,
} from "../generated/prisma/client.js";
import { AccessControlService } from "./access-control.service.js";

describe("AccessControlService", () => {
	const prismaMock = {
		user: {
			findUnique: vi.fn(),
		},

		parkingLot: {
			findUnique: vi.fn(),
		},

		reservation: {
			findFirst: vi.fn(),
		},

		parkingEvent: {
			create: vi.fn(),
		},
	};

	let service: AccessControlService;

	beforeEach(() => {
		vi.clearAllMocks();

		service = new AccessControlService(prismaMock as never);

		prismaMock.user.findUnique.mockResolvedValue({
			id: "user-1",
			isActive: true,
		});

		prismaMock.parkingLot.findUnique.mockResolvedValue({
			id: "parking-1",
			name: "Parking 1",
			address: "Adresa",
			isActive: true,
		});
	});

	it("should grant entry with valid reservation", async () => {
		prismaMock.reservation.findFirst.mockResolvedValue({
			id: "reservation-1",
			startAt: new Date(),
			endAt: new Date(),
			parkingSpace: {
				id: "space-1",
				code: "A1",
			},
		});

		prismaMock.parkingEvent.create.mockResolvedValue({
			id: "event-1",
			type: ParkingEventType.ENTRY,
			result: ParkingAccessResult.GRANTED,
			reason: null,
		});

		const result = await service.requestEntry("user-1", "parking-1");

		expect(result.granted).toBe(true);

		expect(prismaMock.parkingEvent.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					reservationId: "reservation-1",

					type: ParkingEventType.ENTRY,

					result: ParkingAccessResult.GRANTED,
				}),
			}),
		);
	});

	it("should deny entry without valid reservation", async () => {
		prismaMock.reservation.findFirst.mockResolvedValue(null);

		prismaMock.parkingEvent.create.mockResolvedValue({
			id: "event-1",
			type: ParkingEventType.ENTRY,
			result: ParkingAccessResult.DENIED,
			reason: "Nema važeće rezervacije za ulazak u ovom trenutku.",
		});

		const result = await service.requestEntry("user-1", "parking-1");

		expect(result.granted).toBe(false);

		expect(prismaMock.parkingEvent.create).toHaveBeenCalled();
	});

	it("should deny entry when parking lot is inactive", async () => {
		prismaMock.parkingLot.findUnique.mockResolvedValue({
			id: "parking-1",
			name: "Parking 1",
			address: "Adresa",
			isActive: false,
		});

		prismaMock.parkingEvent.create.mockResolvedValue({
			id: "event-1",
			result: ParkingAccessResult.DENIED,
		});

		const result = await service.requestEntry("user-1", "parking-1");

		expect(result.granted).toBe(false);

		expect(prismaMock.reservation.findFirst).not.toHaveBeenCalled();
	});
});
