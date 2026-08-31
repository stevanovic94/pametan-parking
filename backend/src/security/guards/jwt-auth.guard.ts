import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Nedostaje pristupni token.',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

        if (payload.type !== 'access') {
          throw new UnauthorizedException('Token nije pristupni token.');
        }

      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Pristupni token nije validan ili je istekao.',
      );
    }

    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {

    const [type, token] =
      request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer'
      ? token
      : undefined;
  }
}