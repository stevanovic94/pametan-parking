import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    ParkingLotsService,
} from '../parking-lots/parking-lots.service.js';

import {
    PrismaService,
} from '../prisma/prisma.service.js';

import {
    CreateParkingSpaceDto,
} from './dto/create-parking-space.dto.js';

import {
    ParkingSpacesQueryDto,
} from './dto/parking-spaces-query.dto.js';

import {
    UpdateOccupancyDto,
} from './dto/update-occupancy.dto.js';

import {
    UpdateParkingSpaceDto,
} from './dto/update-parking-space.dto.js';


@Injectable()
export class ParkingSpacesService {

    constructor(
        private readonly prisma:
            PrismaService,

        private readonly parkingLotsService:
            ParkingLotsService,
    ) { }


    async create(
        dto: CreateParkingSpaceDto,
    ) {

        /*
         * Proveravamo da parking postoji
         * i da je aktivan.
         */
        await this.parkingLotsService
            .findOne(
                dto.parkingLotId,
            );


        const code =
            this.normalizeCode(
                dto.code,
            );


        await this.ensureCodeAvailable(
            dto.parkingLotId,
            code,
        );


        return this.prisma
            .parkingSpace
            .create({

                data: {
                    parkingLotId:
                        dto.parkingLotId,

                    code,
                },

                include: {
                    parkingLot: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });
    }


    findAll(
        query:
            ParkingSpacesQueryDto,
    ) {

        return this.prisma
            .parkingSpace
            .findMany({

                where: {

                    isActive: true,

                    ...(query.parkingLotId
                        ? {
                            parkingLotId:
                                query.parkingLotId,
                        }
                        : {}),

                    parkingLot: {
                        is: {
                            isActive: true,
                        },
                    },
                },

                include: {
                    parkingLot: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },

                orderBy: [
                    {
                        parkingLot: {
                            name: 'asc',
                        },
                    },
                    {
                        code: 'asc',
                    },
                ],
            });
    }

    findAllForAdmin(
        query: ParkingSpacesQueryDto,
    ) {

        return this.prisma.parkingSpace.findMany({

            where: {

                ...(query.parkingLotId
                    ? {
                        parkingLotId:
                            query.parkingLotId,
                    }
                    : {}),
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
            },

            orderBy: [
                {
                    parkingLot: {
                        name: 'asc',
                    },
                },
                {
                    code: 'asc',
                },
            ],
        });
    }


    async findOne(
        id: string,
    ) {

        const parkingSpace =
            await this.prisma
                .parkingSpace
                .findFirst({

                    where: {
                        id,
                        isActive: true,

                        parkingLot: {
                            is: {
                                isActive: true,
                            },
                        },
                    },

                    include: {
                        parkingLot: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                    },
                });


        if (!parkingSpace) {

            throw new NotFoundException(
                'Parking mesto nije pronađeno.',
            );
        }


        return parkingSpace;
    }


    async update(
        id: string,
        dto: UpdateParkingSpaceDto,
    ) {

        const existing =
            await this.findExistingById(
                id,
            );


        /*
         * Ako ponovo aktiviramo mesto,
         * njegov parking mora biti aktivan.
         */
        if (dto.isActive === true) {

            await this.parkingLotsService
                .findOne(
                    existing.parkingLotId,
                );
        }


        let normalizedCode:
            string | undefined;


        if (dto.code !== undefined) {

            normalizedCode =
                this.normalizeCode(
                    dto.code,
                );


            await this.ensureCodeAvailable(
                existing.parkingLotId,
                normalizedCode,
                existing.id,
            );
        }


        return this.prisma
            .parkingSpace
            .update({

                where: {
                    id,
                },

                data: {

                    ...(normalizedCode !== undefined
                        ? {
                            code:
                                normalizedCode,
                        }
                        : {}),

                    ...(dto.isActive !== undefined
                        ? {
                            isActive:
                                dto.isActive,
                        }
                        : {}),
                },

                include: {
                    parkingLot: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });
    }


    async deactivate(
        id: string,
    ) {

        await this.findExistingById(
            id,
        );


        const parkingSpace =
            await this.prisma
                .parkingSpace
                .update({

                    where: {
                        id,
                    },

                    data: {
                        isActive: false,
                    },
                });


        return {
            message:
                'Parking mesto je deaktivirano.',

            parkingSpace,
        };
    }


    async updateOccupancy(
        id: string,
        dto: UpdateOccupancyDto,
    ) {

        /*
         * Fizičko stanje menjamo samo
         * aktivnom mestu na aktivnom parkingu.
         */
        await this.findOne(id);


        return this.prisma
            .parkingSpace
            .update({

                where: {
                    id,
                },

                data: {
                    occupancyStatus:
                        dto.occupancyStatus,
                },

                include: {
                    parkingLot: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });
    }


    private async findExistingById(
        id: string,
    ) {

        const parkingSpace =
            await this.prisma
                .parkingSpace
                .findUnique({
                    where: {
                        id,
                    },
                });


        if (!parkingSpace) {

            throw new NotFoundException(
                'Parking mesto nije pronađeno.',
            );
        }


        return parkingSpace;
    }


    private normalizeCode(
        code: string,
    ): string {

        return code
            .trim()
            .toUpperCase();
    }


    private async ensureCodeAvailable(
        parkingLotId: string,
        code: string,
        excludedId?: string,
    ): Promise<void> {

        const existing =
            await this.prisma
                .parkingSpace
                .findFirst({

                    where: {
                        parkingLotId,
                        code,

                        ...(excludedId
                            ? {
                                NOT: {
                                    id:
                                        excludedId,
                                },
                            }
                            : {}),
                    },
                });


        if (existing) {

            throw new ConflictException(
                'Parking mesto sa ovom oznakom već postoji na ovoj lokaciji.',
            );
        }
    }
}