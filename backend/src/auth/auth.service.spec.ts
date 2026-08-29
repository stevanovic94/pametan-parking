import { Test } from '@nestjs/testing';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(async () => {
    usersServiceMock.findByEmail.mockReset();
    usersServiceMock.create.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});