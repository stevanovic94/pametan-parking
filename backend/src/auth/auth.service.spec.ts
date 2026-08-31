import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { UsersService } from '../users/users.service.js';

import { AuthService } from './auth.service.js';
import { SessionsService } from './sessions/sessions.service.js';
import { verify } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  };

  const jwtServiceMock = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  const configServiceMock = {
    get: vi.fn((key: string) => {
      if (
        key === 'JWT_REFRESH_EXPIRES_IN_SECONDS'
      ) {
        return '2592000';
      }

      return undefined;
    }),

    getOrThrow: vi.fn((key: string) => {
      if (key === 'JWT_REFRESH_SECRET') {
        return 'test-refresh-secret';
      }

      throw new Error(
        `Missing configuration: ${key}`,
      );
    }),
  };

  const sessionsServiceMock = {
    create: vi.fn(),
    findById: vi.fn(),
    rotateRefreshToken: vi.fn(),
    revoke: vi.fn(),
  };

  beforeEach(async () => {
    usersServiceMock.findByEmail.mockReset();
    usersServiceMock.create.mockReset();
    jwtServiceMock.signAsync.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: SessionsService,
          useValue: sessionsServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject login when user does not exist', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'nepostoji@test.com',
        password: 'Test1234!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});