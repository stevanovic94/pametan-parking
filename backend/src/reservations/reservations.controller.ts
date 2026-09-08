import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import type {
    AuthenticatedRequest,
} from '../security/interfaces/authenticated-request.interface.js';
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
    CreateReservationDto,
} from './dto/create-reservation.dto.js';
import {
    ReservationsQueryDto,
} from './dto/reservations-query.dto.js';
import {
    ReservationsService,
} from './reservations.service.js';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
    constructor(
        private readonly reservationsService:
            ReservationsService,
    ) { }

    @Get('my')
    findMine(
        @Req()
        request: AuthenticatedRequest,
    ) {
        return this.reservationsService.findMine(
            request.user.sub,
        );
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(
        'OPERATOR',
        'ADMIN',
    )
    findAllForStaff(
        @Query()
        query: ReservationsQueryDto,
    ) {
        return this.reservationsService
            .findAllForStaff(query);
    }

    @Post()
    create(
        @Req()
        request: AuthenticatedRequest,

        @Body()
        dto: CreateReservationDto,
    ) {
        return this.reservationsService.create(
            request.user.sub,
            dto,
        );
    }

    @Patch(':id/cancel')
    cancelMine(
        @Req()
        request: AuthenticatedRequest,

        @Param('id')
        id: string,
    ) {
        return this.reservationsService.cancelMine(
            request.user.sub,
            id,
        );
    }
}