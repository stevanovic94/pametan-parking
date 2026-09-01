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
import { TokenSecurityService } from '../services/token-security.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenSecurityService: TokenSecurityService,
  ) { }

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

      if (payload.type !== 'access' || !payload.sid || !payload.jti) {
        throw new UnauthorizedException('Token nije validan pristupni token.');
      }

      const tokenIsBlacklisted =
        await this.tokenSecurityService.isAccessTokenBlacklisted(payload.jti,);

      if (tokenIsBlacklisted) {
        throw new UnauthorizedException('Pristupni token je opozvan.',);
      }

      const sessionIsActive =
        await this.tokenSecurityService.isSessionActive(payload.sid,payload.sub,);

      if (!sessionIsActive) {
        throw new UnauthorizedException('Korisnička sesija više nije aktivna.',);
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