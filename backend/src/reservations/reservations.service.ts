import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationsQueryDto } from './dto/reservations-query.dto.js';

@Injectable()
export class ReservationsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateReservationDto) {
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);

        if (startAt >= endAt) {
            throw new BadRequestException(
                'Vreme početka rezervacije mora biti pre vremena završetka.',
            );
        }

        if (startAt <= new Date()) {
            throw new BadRequestException(
                'Rezervacija mora početi u budućnosti.',
            );
        }

        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                return await this.prisma.$transaction(
                    async (tx) => {
                        const parkingSpace = await tx.parkingSpace.findFirst({
                            where: {
                                id: dto.parkingSpaceId,
                                isActive: true,
                                parkingLot: {
                                    is: {
                                        isActive: true,
                                    },
                                },
                            },
                            select: {
                                id: true,
                            },
                        });

                        if (!parkingSpace) {
                            throw new NotFoundException(
                                'Parking mesto nije pronađeno ili nije aktivno.',
                            );
                        }

                        const overlappingReservation =
                            await tx.reservation.findFirst({
                                where: {
                                    parkingSpaceId: dto.parkingSpaceId,
                                    status: 'CONFIRMED',
                                    startAt: {
                                        lt: endAt,
                                    },
                                    endAt: {
                                        gt: startAt,
                                    },
                                },
                                select: {
                                    id: true,
                                },
                            });

                        if (overlappingReservation) {
                            throw new ConflictException(
                                'Parking mesto je već rezervisano u izabranom terminu.',
                            );
                        }

                        return tx.reservation.create({
                            data: {
                                userId,
                                parkingSpaceId: dto.parkingSpaceId,
                                startAt,
                                endAt,
                                status: 'CONFIRMED',
                            },
                            include: {
                                parkingSpace: {
                                    select: {
                                        id: true,
                                        code: true,
                                        occupancyStatus: true,
                                        parkingLot: {
                                            select: {
                                                id: true,
                                                name: true,
                                                address: true,
                                            },
                                        },
                                    },
                                },
                            },
                        });
                    },
                    {
                        isolationLevel: 'Serializable',
                    },
                );
            } catch (error) {
                if (
                    error instanceof BadRequestException ||
                    error instanceof ConflictException ||
                    error instanceof NotFoundException
                ) {
                    throw error;
                }

                if (this.isSerializationConflict(error) && attempt < 2) {
                    continue;
                }

                throw error;
            }
        }

        throw new ConflictException(
            'Rezervaciju trenutno nije moguće kreirati. Pokušajte ponovo.',
        );
    }

    findMine(userId: string) {
        return this.prisma.reservation.findMany({
            where: {
                userId,
            },
            include: {
                parkingSpace: {
                    select: {
                        id: true,
                        code: true,
                        occupancyStatus: true,
                        parkingLot: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    startAt: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        });
    }

    async cancelMine(
        userId: string,
        reservationId: string,
    ) {
        const reservation =
            await this.prisma.reservation.findFirst({
                where: {
                    id: reservationId,
                    userId,
                },
            });

        if (!reservation) {
            throw new NotFoundException(
                'Rezervacija nije pronađena.',
            );
        }

        if (reservation.status !== 'CONFIRMED') {
            throw new BadRequestException(
                'Samo potvrđena rezervacija može biti otkazana.',
            );
        }

        return this.prisma.reservation.update({
            where: {
                id: reservation.id,
            },
            data: {
                status: 'CANCELLED',
            },
            include: {
                parkingSpace: {
                    select: {
                        id: true,
                        code: true,
                        occupancyStatus: true,
                        parkingLot: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                    },
                },
            },
        });
    }

    private isSerializationConflict(error: unknown): boolean {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: string }).code === 'P2034'
        );
    }

    findAllForStaff(
        query: ReservationsQueryDto,
    ) {
        return this.prisma.reservation.findMany({
            where: {
                ...(query.status
                    ? {
                        status: query.status,
                    }
                    : {}),

                ...(query.parkingLotId
                    ? {
                        parkingSpace: {
                            parkingLotId:
                                query.parkingLotId,
                        },
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
                    },
                },

                parkingSpace: {
                    select: {
                        id: true,
                        code: true,
                        occupancyStatus: true,

                        parkingLot: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },

            orderBy: [
                {
                    startAt: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        });
    }
}