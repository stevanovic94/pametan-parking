import { Injectable, NotFoundException } from "@nestjs/common";
import {
	ParkingAccessResult,
	ParkingEventType,
} from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class AccessControlService {
	constructor(private readonly prisma: PrismaService) {}

	async requestEntry(userId: string, parkingLotId: string) {
		const now = new Date();

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
				isActive: true,
			},
		});

		if (!user) {
			throw new NotFoundException("Korisnik nije pronađen.");
		}

		const parkingLot = await this.prisma.parkingLot.findUnique({
			where: {
				id: parkingLotId,
			},
			select: {
				id: true,
				name: true,
				address: true,
				isActive: true,
			},
		});

		if (!parkingLot) {
			throw new NotFoundException("Parking lokacija nije pronađena.");
		}

		if (!user.isActive) {
			return this.recordDecision({
				userId,
				parkingLotId,
				reservationId: null,
				type: ParkingEventType.ENTRY,
				result: ParkingAccessResult.DENIED,
				reason: "Korisnički nalog nije aktivan.",
				occurredAt: now,
			});
		}

		if (!parkingLot.isActive) {
			return this.recordDecision({
				userId,
				parkingLotId,
				reservationId: null,
				type: ParkingEventType.ENTRY,
				result: ParkingAccessResult.DENIED,
				reason: "Parking lokacija nije aktivna.",
				occurredAt: now,
			});
		}

		const latestGrantedEvent = await this.findLatestGrantedEvent(
			userId,
			parkingLotId,
		);

		if (latestGrantedEvent?.type === ParkingEventType.ENTRY) {
			return this.recordDecision({
				userId,
				parkingLotId,
				reservationId: latestGrantedEvent.reservationId,
				type: ParkingEventType.ENTRY,
				result: ParkingAccessResult.DENIED,
				reason: "Korisnik je već evidentiran kao prisutan na parkingu.",
				occurredAt: now,
			});
		}

		const reservation = await this.prisma.reservation.findFirst({
			where: {
				userId,
				status: "CONFIRMED",

				startAt: {
					lte: now,
				},

				endAt: {
					gt: now,
				},

				parkingSpace: {
					is: {
						parkingLotId,
						isActive: true,
					},
				},
			},

			select: {
				id: true,
				startAt: true,
				endAt: true,

				parkingSpace: {
					select: {
						id: true,
						code: true,
					},
				},
			},

			orderBy: {
				startAt: "desc",
			},
		});

		if (!reservation) {
			return this.recordDecision({
				userId,
				parkingLotId,
				reservationId: null,
				type: ParkingEventType.ENTRY,
				result: ParkingAccessResult.DENIED,
				reason: "Nema važeće rezervacije za ulazak u ovom trenutku.",
				occurredAt: now,
			});
		}

		return this.recordDecision({
			userId,
			parkingLotId,
			reservationId: reservation.id,
			type: ParkingEventType.ENTRY,
			result: ParkingAccessResult.GRANTED,
			reason: null,
			occurredAt: now,
		});
	}

	async requestExit(userId: string, parkingLotId: string) {
		const now = new Date();

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
			},
		});

		if (!user) {
			throw new NotFoundException("Korisnik nije pronađen.");
		}

		const parkingLot = await this.prisma.parkingLot.findUnique({
			where: {
				id: parkingLotId,
			},
			select: {
				id: true,
			},
		});

		if (!parkingLot) {
			throw new NotFoundException("Parking lokacija nije pronađena.");
		}

		const latestGrantedEvent = await this.findLatestGrantedEvent(
			userId,
			parkingLotId,
		);

		if (
			!latestGrantedEvent ||
			latestGrantedEvent.type !== ParkingEventType.ENTRY
		) {
			return this.recordDecision({
				userId,
				parkingLotId,
				reservationId: null,
				type: ParkingEventType.EXIT,
				result: ParkingAccessResult.DENIED,
				reason: "Korisnik nema evidentiran prethodni ulazak na parking.",
				occurredAt: now,
			});
		}

		return this.recordGrantedExit({
			userId,
			parkingLotId,
			reservationId: latestGrantedEvent.reservationId,
			occurredAt: now,
		});
	}

	private findLatestGrantedEvent(userId: string, parkingLotId: string) {
		return this.prisma.parkingEvent.findFirst({
			where: {
				userId,
				parkingLotId,

				result: ParkingAccessResult.GRANTED,
			},

			select: {
				type: true,
				reservationId: true,
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

	private async recordGrantedExit(data: {
		userId: string;
		parkingLotId: string;
		reservationId: string | null;
		occurredAt: Date;
	}) {
		return this.prisma.$transaction(async (tx) => {
			if (data.reservationId) {
				await tx.reservation.updateMany({
					where: {
						id: data.reservationId,

						status: "CONFIRMED",
					},

					data: {
						status: "COMPLETED",
					},
				});
			}

			const event = await tx.parkingEvent.create({
				data: {
					userId: data.userId,

					parkingLotId: data.parkingLotId,

					reservationId: data.reservationId,

					type: ParkingEventType.EXIT,

					result: ParkingAccessResult.GRANTED,

					reason: null,

					occurredAt: data.occurredAt,
				},

				include: {
					parkingLot: {
						select: {
							id: true,
							name: true,
							address: true,
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
			});

			return {
				granted: true,
				reason: null,
				event,
			};
		});
	}

	private async recordDecision(data: {
		userId: string;
		parkingLotId: string;
		reservationId: string | null;
		type: ParkingEventType;
		result: ParkingAccessResult;
		reason: string | null;
		occurredAt: Date;
	}) {
		const event = await this.prisma.parkingEvent.create({
			data: {
				userId: data.userId,

				parkingLotId: data.parkingLotId,

				reservationId: data.reservationId,

				type: data.type,

				result: data.result,

				reason: data.reason,

				occurredAt: data.occurredAt,
			},

			include: {
				parkingLot: {
					select: {
						id: true,
						name: true,
						address: true,
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
		});

		return {
			granted: data.result === ParkingAccessResult.GRANTED,

			reason: data.reason,

			event,
		};
	}
}
