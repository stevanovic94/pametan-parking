import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    Roles,
} from '../security/decorators/roles.decorator.js';

import {
    JwtAuthGuard,
} from '../security/guards/jwt-auth.guard.js';

import {
    RolesGuard,
} from '../security/guards/roles.guard.js';

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

import {
    ParkingSpacesService,
} from './parking-spaces.service.js';


@Controller('parking-spaces')
@UseGuards(JwtAuthGuard)
export class ParkingSpacesController {

    constructor(
        private readonly parkingSpacesService:
            ParkingSpacesService,
    ) { }


    @Get()
    findAll(
        @Query()
        query: ParkingSpacesQueryDto,
    ) {

        return this.parkingSpacesService
            .findAll(query);
    }


    @Get(':id')
    findOne(
        @Param('id')
        id: string,
    ) {

        return this.parkingSpacesService
            .findOne(id);
    }


    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    create(
        @Body()
        dto: CreateParkingSpaceDto,
    ) {

        return this.parkingSpacesService
            .create(dto);
    }


    /*
     * Fizičko stanje izdvajamo od
     * administrativnog PATCH-a.
     */
    @Patch(':id/occupancy')
    @UseGuards(RolesGuard)
    @Roles(
        'OPERATOR',
        'ADMIN',
    )
    updateOccupancy(
        @Param('id')
        id: string,

        @Body()
        dto: UpdateOccupancyDto,
    ) {

        return this.parkingSpacesService
            .updateOccupancy(
                id,
                dto,
            );
    }


    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    update(
        @Param('id')
        id: string,

        @Body()
        dto: UpdateParkingSpaceDto,
    ) {

        return this.parkingSpacesService
            .update(
                id,
                dto,
            );
    }


    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    deactivate(
        @Param('id')
        id: string,
    ) {

        return this.parkingSpacesService
            .deactivate(id);
    }
}