import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ParkingEventsQueryDto } from "./dto/parking-events-query.dto.js";

@Injectable()
export class ParkingEventsService {
	constructor(private readonly prisma: PrismaService) {}

	findMine(userId: string) {
		return this.prisma.parkingEvent.findMany({
			where: {
				userId,
			},

			include: {
				parkingLot: {
					select: {
						id: true,
						name: true,
						address: true,
						isActive: true,
					},
				},

				reservation: {
					select: {
						id: true,
						startAt: true,
						endAt: true,
						status: true,

						parkingSpace: {
							select: {
								id: true,
								code: true,
							},
						},
					},
				},
			},

			orderBy: [
				{
					occurredAt: "desc",
				},
				{
					createdAt: "desc",
				},
			],
		});
	}

	findAllForStaff(query: ParkingEventsQueryDto) {
		return this.prisma.parkingEvent.findMany({
			where: {
				...(query.parkingLotId
					? {
							parkingLotId: query.parkingLotId,
						}
					: {}),

				...(query.type
					? {
							type: query.type,
						}
					: {}),

				...(query.result
					? {
							result: query.result,
						}
					: {}),
			},

			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						role: true,
						isActive: true,
					},
				},

				parkingLot: {
					select: {
						id: true,
						name: true,
						address: true,
						isActive: true,
					},
				},

				reservation: {
					select: {
						id: true,
						startAt: true,
						endAt: true,
						status: true,

						parkingSpace: {
							select: {
								id: true,
								code: true,
							},
						},
					},
				},
			},

			orderBy: [
				{
					occurredAt: "desc",
				},
				{
					createdAt: "desc",
				},
			],
		});
	}
}
