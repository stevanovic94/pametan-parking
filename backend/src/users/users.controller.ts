import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Roles } from '../security/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard.js';
import { RolesGuard } from '../security/guards/roles.guard.js';

@Controller('users')

@UseGuards(
    JwtAuthGuard,
    RolesGuard,
)

@Roles('ADMIN')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }
}
