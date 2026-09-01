import {
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard.js';
import { TokenSecurityService } from '../services/token-security.service.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const jwtServiceMock = {
    verifyAsync: vi.fn(),
  };

  const tokenSecurityServiceMock = {
    isAccesTokenBlacklisted: vi.fn(),
    isSessionActive: vi.fn(),
  }

  beforeEach(() => {
    jwtServiceMock.verifyAsync.mockReset();
    tokenSecurityServiceMock.isAccesTokenBlacklisted.mockReset();
    tokenSecurityServiceMock.isSessionActive.mockReset();

    guard = new JwtAuthGuard(
      jwtServiceMock as unknown as JwtService,
      tokenSecurityServiceMock as unknown as TokenSecurityService,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should reject request without token', async () => {
    const request = {
      headers: {},
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(
      guard.canActivate(context as never),
    ).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});