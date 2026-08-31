import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';

import { JwtAuthGuard } from '../security/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../security/interfaces/authenticated-request.interface.js';
import type { JwtPayload } from '../security/interfaces/jwt-payload.interface.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(
        @Body() registerDto: RegisterDto,
    ) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(
        @Body() loginDto: LoginDto
    ) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(
        @Req() request: AuthenticatedRequest,
    ) {
        return request.user;
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(
        @Body() refreshDto: RefreshDto,
    ) {
        return this.authService.refresh(
            refreshDto,
        );
    }
}


