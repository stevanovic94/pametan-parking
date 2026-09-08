import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateParkingLotDto } from './dto/create-parking-lot.dto.js';
import { UpdateParkingLotDto } from './dto/update-parking-lot.dto.js';
import { ParkingSpaceOccupancy } from '../generated/prisma/enums.js';


@Injectable()
export class ParkingLotsService {

    constructor(
        private readonly prisma:
            PrismaService,
    ) { }


    create(
        dto: CreateParkingLotDto,
    ) {

        return this.prisma.parkingLot.create({
            data: {
                name:
                    dto.name.trim(),

                address:
                    dto.address.trim(),

                description:
                    dto.description?.trim() ||
                    null,
            },
        });
    }


    findAll() {

        return this.prisma.parkingLot.findMany({
            where: {
                isActive: true,
            },

            orderBy: {
                name: 'asc',
            },
        });
    }

    async findOverview() {
        const parkingLots = await this.prisma.parkingLot.findMany({
            where: {
                isActive: true,
            },
            include: {
                spaces: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        occupancyStatus: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return parkingLots.map(({ spaces, ...parkingLot }) => ({
            ...parkingLot,
            spaceStats: {
                total: spaces.length,
                free: spaces.filter(
                    space => space.occupancyStatus === ParkingSpaceOccupancy.FREE,
                ).length,
                occupied: spaces.filter(
                    space => space.occupancyStatus === ParkingSpaceOccupancy.OCCUPIED,
                ).length,
                unknown: spaces.filter(
                    space => space.occupancyStatus === ParkingSpaceOccupancy.UNKNOWN,
                ).length,
            },
        }));
    }

    // i deaktivirane
    findAllForAdmin() {

        return this.prisma.parkingLot.findMany({

            orderBy: [
                {
                    isActive: 'desc',
                },
                {
                    name: 'asc',
                },
            ],
        });
    }

    async findOne(
        id: string,
    ) {

        const parkingLot =
            await this.prisma.parkingLot
                .findFirst({
                    where: {
                        id,
                        isActive: true,
                    },
                });


        if (!parkingLot) {

            throw new NotFoundException(
                'Parking lokacija nije pronađena.',
            );
        }


        return parkingLot;
    }


    async update(
        id: string,
        dto: UpdateParkingLotDto,
    ) {

        await this.findExistingById(id);


        const data = {

            ...(dto.name !== undefined
                ? {
                    name:
                        dto.name.trim(),
                }
                : {}),


            ...(dto.address !== undefined
                ? {
                    address:
                        dto.address.trim(),
                }
                : {}),


            ...(dto.description !== undefined
                ? {
                    description:
                        dto.description.trim() ||
                        null,
                }
                : {}),


            ...(dto.isActive !== undefined
                ? {
                    isActive:
                        dto.isActive,
                }
                : {}),
        };


        return this.prisma.parkingLot.update({
            where: {
                id,
            },

            data,
        });
    }


    async deactivate(
        id: string,
    ) {

        await this.findExistingById(id);


        const parkingLot =
            await this.prisma.parkingLot.update({
                where: {
                    id,
                },

                data: {
                    isActive: false,
                },
            });


        return {
            message:
                'Parking lokacija je deaktivirana.',

            parkingLot,
        };
    }


    private async findExistingById(
        id: string,
    ) {

        const parkingLot =
            await this.prisma.parkingLot
                .findUnique({
                    where: {
                        id,
                    },
                });


        if (!parkingLot) {

            throw new NotFoundException(
                'Parking lokacija nije pronađena.',
            );
        }


        return parkingLot;
    }
}