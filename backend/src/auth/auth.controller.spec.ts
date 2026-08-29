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
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();

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
});