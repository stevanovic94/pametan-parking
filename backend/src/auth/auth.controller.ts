import { Controller, Body, Post, HttpCode, HttpStatus, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
}


