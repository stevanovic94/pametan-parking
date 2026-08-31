import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

import { UsersService } from '../users/users.service.js';

import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface.js';
import { SessionsService } from './sessions/sessions.service.js';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
  ) { }

  private getRefreshSecret(): string {
    return this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET',
    );
  }

  private getRefreshExpiresInSeconds(): number {
    return Number(
      this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN_SECONDS',
      ) ?? '2592000',
    );
  }

  private createAccessToken(user: {
    id: string;
    email: string;
    role: 'USER' | 'OPERATOR' | 'ADMIN';
  }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    });
  }

  // Asinhrona funkcija - izvrsavanje traje neko vreme
  // (zbog pristupa bazi, slanja HTTP zahteva, citanja fajla...),
  // pritom ne blokira ostatak programa.
  // await - ceka rezultat
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Korisnik sa ovom email adresom već postoji.');
    }

    const passwordHash = await argon2.hash(registerDto.password, { type: argon2.argon2id });

    return this.usersService.create(
      registerDto.firstName.trim(),
      registerDto.lastName.trim(),
      email,
      passwordHash,
    );
  }

  async login(loginDto: LoginDto) {

    const email = loginDto.email.trim().toLocaleLowerCase();
    const user = await this.usersService.findByEmail(email);

    // ista poruka i kada korisnik ne postoji i kada je lozinka pogresna.
    // U suprotnom, se moze proveriti koje email adrese postoje u sistemu.
    if (!user) {
      throw new UnauthorizedException('Neispravan email ili lozinka.');
    }

    // poredjenje hash-a iz baze sa unetim, lozinka se ne desifruje
    const passwordIsValid = await argon2.verify(user.passwordHash, loginDto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Neispravan email ili lozinka.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Korisnički nalog je deaktiviran.');
    }

    const sessionId = randomUUID();
    const refreshExpiresInSeconds = this.getRefreshExpiresInSeconds();
    const sessionExpiresAt = new Date(Date.now() + refreshExpiresInSeconds * 1000,);
    const accessToken = await this.createAccessToken(user);
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sid: sessionId,
      type: 'refresh',
    };

    const refreshToken = await this.jwtService.signAsync(
      refreshPayload,
      {
        secret: this.getRefreshSecret(),
        expiresIn: refreshExpiresInSeconds,
      },
    );

    const refreshTokenHash = await argon2.hash(
      refreshToken,
      {
        type: argon2.argon2id,
      },
    );

    await this.sessionsService.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: sessionExpiresAt,
    });

    return {
      accessToken,
      refreshToken,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refresh(refreshDto: RefreshDto) {
    const refreshToken = refreshDto.refreshToken;

    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret: this.getRefreshSecret(),
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Refresh token nije validan ili je istekao.',
      );
    }

    if (
      payload.type !== 'refresh' ||
      !payload.sub ||
      !payload.sid
    ) {
      throw new UnauthorizedException(
        'Refresh token nije validan.',
      );
    }

    const session =
      await this.sessionsService.findById(
        payload.sid,
      );

    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException(
        'Sesija nije validna ili je istekla.',
      );
    }

    const refreshTokenMatches =
      await argon2.verify(
        session.refreshTokenHash,
        refreshToken,
      );

    if (!refreshTokenMatches) {
      await this.sessionsService.revoke(
        session.id,
      );

      throw new UnauthorizedException(
        'Refresh token više nije validan.',
      );
    }

    const user =
      await this.usersService.findById(
        payload.sub,
      );

    if (!user || !user.isActive) {
      await this.sessionsService.revoke(
        session.id,
      );

      throw new UnauthorizedException(
        'Korisnička sesija više nije validna.',
      );
    }

    const remainingSeconds = Math.floor(
      (
        session.expiresAt.getTime() -
        Date.now()
      ) / 1000,
    );

    if (remainingSeconds <= 0) {
      await this.sessionsService.revoke(
        session.id,
      );

      throw new UnauthorizedException(
        'Sesija je istekla.',
      );
    }

    const newAccessToken =
      await this.createAccessToken(user);

    const newRefreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sid: session.id,
      type: 'refresh',
    };

    const newRefreshToken =
      await this.jwtService.signAsync(
        newRefreshPayload,
        {
          secret: this.getRefreshSecret(),
          expiresIn: remainingSeconds,
        },
      );

    const newRefreshTokenHash =
      await argon2.hash(
        newRefreshToken,
        {
          type: argon2.argon2id,
        },
      );

    await this.sessionsService.rotateRefreshToken(
      session.id,
      newRefreshTokenHash,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

}