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

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: vi.fn(),
    login: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();
    authServiceMock.login.mockReset();

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
    }).compile();

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
      id: 'test-id',
      email: 'petar@test.com',
      role: 'USER',
    };

    authServiceMock.login.mockResolvedValue(response);

    const result = await controller.login(loginDto);

    expect(result).toEqual(response);
    expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
});

});