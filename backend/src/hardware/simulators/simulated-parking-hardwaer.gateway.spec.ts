import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SimulatedParkingHardwareGateway } from "./simulated-parking-hardware.gateway.js";

describe("SimulatedParkingHardwareGateway", () => {
	let gateway: SimulatedParkingHardwareGateway;

	beforeEach(() => {
		vi.useFakeTimers();

		gateway = new SimulatedParkingHardwareGateway();
	});

	afterEach(() => {
		gateway.reset();

		vi.useRealTimers();
	});

	it("should initialize barriers as closed", () => {
		const state = gateway.getState("parking-1");

		expect(state.barriers.ENTRY).toBe("CLOSED");

		expect(state.barriers.EXIT).toBe("CLOSED");

		expect(state.freeSpaces).toBeNull();
	});

	it("should open entry barrier", async () => {
		await gateway.openBarrier("parking-1", "ENTRY");

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("OPEN");
	});

	it("should automatically close barrier after 12 seconds", async () => {
		await gateway.openBarrier("parking-1", "ENTRY");

		await vi.advanceTimersByTimeAsync(11_999);

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("OPEN");

		await vi.advanceTimersByTimeAsync(1);

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("CLOSED");
	});

	it("should allow manual barrier closing", async () => {
		await gateway.openBarrier("parking-1", "ENTRY");

		await gateway.closeBarrier("parking-1", "ENTRY");

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("CLOSED");
	});

	it("should restart automatic closing timer when barrier is opened again", async () => {
		await gateway.openBarrier("parking-1", "ENTRY");

		await vi.advanceTimersByTimeAsync(10_000);

		await gateway.openBarrier("parking-1", "ENTRY");

		await vi.advanceTimersByTimeAsync(2_001);

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("OPEN");

		await vi.advanceTimersByTimeAsync(9_999);

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("CLOSED");
	});

	it("should keep entry and exit barriers independent", async () => {
		await gateway.openBarrier("parking-1", "EXIT");

		const state = gateway.getState("parking-1");

		expect(state.barriers.ENTRY).toBe("CLOSED");

		expect(state.barriers.EXIT).toBe("OPEN");
	});

	it("should update free spaces display", async () => {
		await gateway.updateFreeSpacesDisplay("parking-1", 7);

		expect(gateway.getState("parking-1").freeSpaces).toBe(7);
	});

	it("should not allow negative display value", async () => {
		await gateway.updateFreeSpacesDisplay("parking-1", -3);

		expect(gateway.getState("parking-1").freeSpaces).toBe(0);
	});

	it("should keep separate state for different parking lots", async () => {
		await gateway.openBarrier("parking-1", "ENTRY");

		await gateway.updateFreeSpacesDisplay("parking-2", 12);

		expect(gateway.getState("parking-1").barriers.ENTRY).toBe("OPEN");

		expect(gateway.getState("parking-2").barriers.ENTRY).toBe("CLOSED");

		expect(gateway.getState("parking-2").freeSpaces).toBe(12);
	});
});
