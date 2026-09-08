import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthenticatedRequest } from "../security/interfaces/authenticated-request.interface.js";
import { AccessControlController } from "./access-control.controller.js";
import { AccessControlService } from "./access-control.service.js";

describe("AccessControlController", () => {
	const serviceMock = {
		requestEntry: vi.fn(),
		requestExit: vi.fn(),
	};

	let controller: AccessControlController;

	beforeEach(() => {
		vi.clearAllMocks();

		controller = new AccessControlController(
			serviceMock as unknown as AccessControlService,
		);
	});

	it("should request entry for authenticated user", async () => {
		serviceMock.requestEntry.mockResolvedValue({
			granted: true,
			reason: null,
		});

		const request = {
			user: {
				sub: "user-1",
				email: "user@test.com",
				role: "USER",
			},
		} as unknown as AuthenticatedRequest;

		const dto = {
			parkingLotId: "parking-1",
		};

		const result = await controller.requestEntry(request, dto);

		expect(serviceMock.requestEntry).toHaveBeenCalledWith(
			"user-1",
			"parking-1",
		);

		expect(result.granted).toBe(true);
	});

	it("should request exit for authenticated user", async () => {
		serviceMock.requestExit.mockResolvedValue({
			granted: true,
			reason: null,
		});

		const request = {
			user: {
				sub: "user-1",
				email: "user@test.com",
				role: "USER",
			},
		} as unknown as AuthenticatedRequest;

		const dto = {
			parkingLotId: "parking-1",
		};

		const result = await controller.requestExit(request, dto);

		expect(serviceMock.requestExit).toHaveBeenCalledWith("user-1", "parking-1");

		expect(result.granted).toBe(true);
	});
  
});
