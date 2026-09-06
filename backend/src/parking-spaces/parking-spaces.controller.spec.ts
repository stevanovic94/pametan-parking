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
  JwtAuthGuard,
} from '../security/guards/jwt-auth.guard.js';

import {
  RolesGuard,
} from '../security/guards/roles.guard.js';

import {
  ParkingSpacesController,
} from './parking-spaces.controller.js';

import {
  ParkingSpacesService,
} from './parking-spaces.service.js';


describe(
  'ParkingSpacesController',
  () => {

    let controller:
      ParkingSpacesController;


    const serviceMock = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      updateOccupancy: vi.fn(),
    };


    const guardMock = {
      canActivate:
        vi.fn(() => true),
    };


    beforeEach(async () => {

      vi.clearAllMocks();


      const moduleRef =
        await Test
          .createTestingModule({

            controllers: [
              ParkingSpacesController,
            ],

            providers: [
              {
                provide:
                  ParkingSpacesService,

                useValue:
                  serviceMock,
              },
            ],
          })

          .overrideGuard(
            JwtAuthGuard,
          )
          .useValue(
            guardMock,
          )

          .overrideGuard(
            RolesGuard,
          )
          .useValue(
            guardMock,
          )

          .compile();


      controller =
        moduleRef.get(
          ParkingSpacesController,
        );
    });


    it(
      'should be defined',
      () => {

        expect(
          controller,
        ).toBeDefined();
      },
    );


    it(
      'should return parking spaces',
      async () => {

        const spaces = [
          {
            id: 'space-1',
            code: 'A1',
          },
        ];


        serviceMock
          .findAll
          .mockResolvedValue(
            spaces,
          );


        const result =
          await controller
            .findAll({});


        expect(
          result,
        ).toEqual(
          spaces,
        );


        expect(
          serviceMock.findAll,
        ).toHaveBeenCalledWith(
          {},
        );
      },
    );
  },
);