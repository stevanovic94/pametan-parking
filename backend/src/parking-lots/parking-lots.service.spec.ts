import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service.js";
import { ParkingLotsService } from "./parking-lots.service.js";

describe("ParkingLotsService", () => {
	let service: ParkingLotsService;

	const prismaMock = {
		parkingLot: {
			create: vi.fn(),
			findMany: vi.fn(),
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
		},
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			providers: [
				ParkingLotsService,
				{
					provide: PrismaService,
					useValue: prismaMock,
				},
			],
		}).compile();

		service = moduleRef.get(ParkingLotsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should return active parking lots", async () => {
		prismaMock.parkingLot.findMany.mockResolvedValue([]);

		await service.findAll();

		expect(prismaMock.parkingLot.findMany).toHaveBeenCalledWith({
			where: {
				isActive: true,
			},
			orderBy: {
				name: "asc",
			},
		});
	});

	it("should include inactive parking lots in map overview", async () => {
		prismaMock.parkingLot.findMany.mockResolvedValue([
			{
				id: "parking-1",
				name: "Parking 1",
				address: "Ulica 1",
				description: null,
				latitude: 44.8,
				longitude: 20.4,
				isActive: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				spaces: [
					{
						occupancyStatus: "FREE",
						reservations: [],
					},
					{
						occupancyStatus: "OCCUPIED",
						reservations: [],
					},
				],
			},
		]);

		const result = await service.findMapOverview();

		expect(result).toHaveLength(1);

		expect(result[0].isActive).toBe(false);

		expect(result[0].spaceStats.total).toBe(2);

		expect(prismaMock.parkingLot.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {},
			}),
		);
	});

	it("should reject missing parking lot", async () => {
		prismaMock.parkingLot.findFirst.mockResolvedValue(null);

		await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});
});
