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

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const jwtServiceMock = {
    verifyAsync: vi.fn(),
  };

  beforeEach(() => {
    jwtServiceMock.verifyAsync.mockReset();

    guard = new JwtAuthGuard(
      jwtServiceMock as unknown as JwtService,
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