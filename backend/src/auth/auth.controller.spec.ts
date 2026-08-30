import { Test } from '@nestjs/testing';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: vi.fn(),
    login: vi.fn(),
  };

  const jwtAuthGuardMock = {
    canActivate: vi.fn(() => true),
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();
    authServiceMock.login.mockReset();
    jwtAuthGuardMock.canActivate.mockReset();

    jwtAuthGuardMock.canActivate.mockReturnValue(true);

    const moduleRef = await Test.createTestingModule({
      controllers: [
        AuthController,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile();

    controller =
      moduleRef.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user', async () => {
    const loginDto = {
      email: 'petar@test.com',
      password: 'Test1234!',
    };

    const response = {
      accessToken: 'test-access-token',
      user: {
        id: 'test-id',
        email: 'petar@test.com',
        role: 'USER',
      },
    };

    authServiceMock.login.mockResolvedValue(response);

    const result =
      await controller.login(loginDto);

    expect(result).toEqual(response);

    expect(
      authServiceMock.login,
    ).toHaveBeenCalledWith(loginDto);
  });
});