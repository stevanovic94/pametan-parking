import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    prismaMock.user.findMany.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return users', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
    expect(prismaMock.user.findMany).toHaveBeenCalledOnce();
  });
});