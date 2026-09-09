import { beforeEach, describe, expect, it, vi } from "vitest";
import { ParkingEventsService } from "./parking-events.service.js";

describe("ParkingEventsService", () => {
	const prismaMock = {
		parkingEvent: {
			findMany: vi.fn(),
		},
	};

	let service: ParkingEventsService;

	beforeEach(() => {
		vi.resetAllMocks();

		service = new ParkingEventsService(prismaMock as never);
	});

	it("should return authenticated user parking events", async () => {
		prismaMock.parkingEvent.findMany.mockResolvedValue([
			{
				id: "event-1",
				userId: "user-1",
				type: "ENTRY",
				result: "GRANTED",
			},
		]);

		const result = await service.findMine("user-1");

		expect(prismaMock.parkingEvent.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					userId: "user-1",
				},
			}),
		);

		expect(result).toHaveLength(1);
	});

	it("should return empty array when user has no events", async () => {
		prismaMock.parkingEvent.findMany.mockResolvedValue([]);

		const result = await service.findMine("user-1");

		expect(result).toEqual([]);
	});

	it("should return all staff parking events without filters", async () => {
		prismaMock.parkingEvent.findMany.mockResolvedValue([]);

		await service.findAllForStaff({});

		expect(prismaMock.parkingEvent.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {},
			}),
		);
	});

	it("should filter staff parking events", async () => {
		prismaMock.parkingEvent.findMany.mockResolvedValue([
			{
				id: "event-1",
				parkingLotId: "parking-1",
				type: "ENTRY",
				result: "DENIED",
			},
		]);

		const result = await service.findAllForStaff({
			parkingLotId: "parking-1",

			type: "ENTRY",

			result: "DENIED",
		});

		expect(prismaMock.parkingEvent.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					parkingLotId: "parking-1",

					type: "ENTRY",

					result: "DENIED",
				},
			}),
		);

		expect(result).toHaveLength(1);
	});
});
