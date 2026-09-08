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
			findFirst: vi.fn(),
			create: vi.fn(),
		},

		$transaction: vi.fn(),
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

		prismaMock.parkingEvent.findFirst.mockResolvedValue(null);
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

	it("should grant exit after granted entry", async () => {
		prismaMock.parkingEvent.findFirst.mockResolvedValue({
			type: ParkingEventType.ENTRY,

			reservationId: "reservation-1",
		});

		const txMock = {
			reservation: {
				updateMany: vi.fn().mockResolvedValue({
					count: 1,
				}),
			},

			parkingEvent: {
				create: vi.fn().mockResolvedValue({
					id: "event-exit",
					type: ParkingEventType.EXIT,
					result: ParkingAccessResult.GRANTED,
					reason: null,
				}),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		const result = await service.requestExit("user-1", "parking-1");

		expect(result.granted).toBe(true);

		expect(txMock.reservation.updateMany).toHaveBeenCalledWith({
			where: {
				id: "reservation-1",
				status: "CONFIRMED",
			},

			data: {
				status: "COMPLETED",
			},
		});

		expect(txMock.parkingEvent.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					type: ParkingEventType.EXIT,

					result: ParkingAccessResult.GRANTED,

					reservationId: "reservation-1",
				}),
			}),
		);
	});

	it("should deny exit without previous granted entry", async () => {
		prismaMock.parkingEvent.findFirst.mockResolvedValue(null);

		prismaMock.parkingEvent.create.mockResolvedValue({
			id: "event-exit-denied",
			type: ParkingEventType.EXIT,
			result: ParkingAccessResult.DENIED,
		});

		const result = await service.requestExit("user-1", "parking-1");

		expect(result.granted).toBe(false);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("should deny second entry while user is already inside", async () => {
		prismaMock.parkingEvent.findFirst.mockResolvedValue({
			type: ParkingEventType.ENTRY,

			reservationId: "reservation-1",
		});

		prismaMock.parkingEvent.create.mockResolvedValue({
			id: "event-entry-denied",
			type: ParkingEventType.ENTRY,
			result: ParkingAccessResult.DENIED,
		});

		const result = await service.requestEntry("user-1", "parking-1");

		expect(result.granted).toBe(false);

		expect(prismaMock.reservation.findFirst).not.toHaveBeenCalled();
	});

	
});
