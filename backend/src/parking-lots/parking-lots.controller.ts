import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
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
    CreateParkingLotDto,
} from './dto/create-parking-lot.dto.js';

import {
    UpdateParkingLotDto,
} from './dto/update-parking-lot.dto.js';

import {
    ParkingLotsService,
} from './parking-lots.service.js';


@Controller('parking-lots')
@UseGuards(JwtAuthGuard)
export class ParkingLotsController {

    constructor(
        private readonly parkingLotsService:
            ParkingLotsService,
    ) { }


    @Get()
    findAll() {

        return this.parkingLotsService
            .findAll();
    }


    @Get(':id')
    findOne(
        @Param('id') id: string,
    ) {

        return this.parkingLotsService
            .findOne(id);
    }


    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    create(
        @Body()
        dto: CreateParkingLotDto,
    ) {

        return this.parkingLotsService
            .create(dto);
    }


    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    update(
        @Param('id') id: string,

        @Body()
        dto: UpdateParkingLotDto,
    ) {

        return this.parkingLotsService
            .update(
                id,
                dto,
            );
    }


    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    deactivate(
        @Param('id') id: string,
    ) {

        return this.parkingLotsService
            .deactivate(id);
    }
}