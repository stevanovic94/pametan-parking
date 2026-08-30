import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

import { JwtAuthGuard } from '../security/guards/jwt-auth.guard.js';
import { RolesGuard } from '../security/guards/roles.guard.js';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    findAll: vi.fn(),
  };

  const jwtAuthGuardMock = {
    canActivate: vi.fn(() => true),
  };

  const rolesGuardMock = {
    canActivate: vi.fn(() => true),
  };

  beforeEach(async () => {
    usersServiceMock.findAll.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [
        UsersController,
      ],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    controller = moduleRef.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return users', async () => {
    usersServiceMock.findAll.mockResolvedValue([]);

    const result = await controller.findAll();

    expect(result).toEqual([]);
    expect(usersServiceMock.findAll).toHaveBeenCalledOnce();
  });
});