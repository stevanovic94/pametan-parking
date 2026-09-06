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
  ParkingLotsController,
} from './parking-lots.controller.js';

import {
  ParkingLotsService,
} from './parking-lots.service.js';


describe(
  'ParkingLotsController',
  () => {

    let controller:
      ParkingLotsController;


    const serviceMock = {

      create:
        vi.fn(),

      findAll:
        vi.fn(),

      findOne:
        vi.fn(),

      update:
        vi.fn(),

      deactivate:
        vi.fn(),

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
              ParkingLotsController,
            ],

            providers: [

              {
                provide:
                  ParkingLotsService,

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
          ParkingLotsController,
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
      'should return parking lots',
      async () => {

        const parkingLots = [
          {
            id: 'parking-1',
            name: 'Parking A',
          },
        ];


        serviceMock
          .findAll
          .mockResolvedValue(
            parkingLots,
          );


        const result =
          await controller
            .findAll();


        expect(
          result,
        ).toEqual(
          parkingLots,
        );


        expect(
          serviceMock.findAll,
        ).toHaveBeenCalled();
      },
    );
  },
);