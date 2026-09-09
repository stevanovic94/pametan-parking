import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthenticatedRequest } from "../security/interfaces/authenticated-request.interface.js";
import { ParkingEventsController } from "./parking-events.controller.js";
import { ParkingEventsService } from "./parking-events.service.js";

describe("ParkingEventsController", () => {
	const serviceMock = {
		findMine: vi.fn(),

		findAllForStaff: vi.fn(),
	};

	let controller: ParkingEventsController;

	beforeEach(() => {
		vi.resetAllMocks();

		controller =
      new ParkingEventsController(
        serviceMock as unknown as ParkingEventsService,
      );
	});

	it("should return authenticated user parking events", async () => {
		serviceMock.findMine.mockResolvedValue([
			{
				id: "event-1",
				userId: "user-1",
				type: "ENTRY",
				result: "GRANTED",
			},
		]);

		const request = {
			user: {
				sub: "user-1",
				email: "user@test.com",
				role: "USER",
			},
		} as unknown as AuthenticatedRequest;

		const result = await controller.findMine(request);

		expect(serviceMock.findMine).toHaveBeenCalledWith("user-1");

		expect(result).toHaveLength(1);
	});

	it("should return staff parking events", async () => {
		serviceMock.findAllForStaff.mockResolvedValue([
			{
				id: "event-1",
				type: "ENTRY",
				result: "DENIED",
			},
		]);

		const query = {
			type: "ENTRY" as const,

			result: "DENIED" as const,
		};

		const result = await controller.findAllForStaff(query);

		expect(serviceMock.findAllForStaff).toHaveBeenCalledWith(query);

		expect(result).toHaveLength(1);
	});
});
