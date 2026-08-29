import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () =>
              'postgresql://test:test@localhost:5432/test',
          },
        },
      ],
    }).compile();

    service = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
