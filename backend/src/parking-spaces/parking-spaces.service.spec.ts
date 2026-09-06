import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import {
  Test,
} from '@nestjs/testing';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ParkingLotsService,
} from '../parking-lots/parking-lots.service.js';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  ParkingSpacesService,
} from './parking-spaces.service.js';


describe('ParkingSpacesService', () => {

  let service:
    ParkingSpacesService;


  const prismaMock = {

    parkingSpace: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },

  };


  const parkingLotsServiceMock = {
    findOne: vi.fn(),
  };


  beforeEach(async () => {

    vi.clearAllMocks();


    const moduleRef =
      await Test.createTestingModule({

        providers: [

          ParkingSpacesService,

          {
            provide:
              PrismaService,

            useValue:
              prismaMock,
          },

          {
            provide:
              ParkingLotsService,

            useValue:
              parkingLotsServiceMock,
          },

        ],
      }).compile();


    service =
      moduleRef.get(
        ParkingSpacesService,
      );
  });


  it(
    'should be defined',
    () => {

      expect(
        service,
      ).toBeDefined();
    },
  );


  it(
    'should reject missing parking space',
    async () => {

      prismaMock
        .parkingSpace
        .findFirst
        .mockResolvedValue(null);


      await expect(
        service.findOne(
          'missing-id',
        ),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    },
  );


  it(
    'should normalize parking space code',
    async () => {

      parkingLotsServiceMock
        .findOne
        .mockResolvedValue({
          id: 'parking-1',
        });


      prismaMock
        .parkingSpace
        .findFirst
        .mockResolvedValue(null);


      prismaMock
        .parkingSpace
        .create
        .mockResolvedValue({
          id: 'space-1',
          code: 'A1',
        });


      await service.create({
        parkingLotId:
          'parking-1',

        code:
          ' a1 ',
      });


      expect(
        prismaMock
          .parkingSpace
          .create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({

          data: {
            parkingLotId:
              'parking-1',

            code:
              'A1',
          },

        }),
      );
    },
  );


  it(
    'should reject duplicate code on same parking lot',
    async () => {

      parkingLotsServiceMock
        .findOne
        .mockResolvedValue({
          id: 'parking-1',
        });


      prismaMock
        .parkingSpace
        .findFirst
        .mockResolvedValue({
          id: 'space-existing',
        });


      await expect(
        service.create({
          parkingLotId:
            'parking-1',

          code:
            'A1',
        }),
      ).rejects.toBeInstanceOf(
        ConflictException,
      );
    },
  );
});