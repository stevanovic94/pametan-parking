import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthenticatedRequest } from '../security/interfaces/authenticated-request.interface.js';

import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';


describe('ReservationsController', () => {
  const reservationsServiceMock = {
    create: vi.fn(),
    findMine: vi.fn(),
    cancelMine: vi.fn(),
    findAllForStaff: vi.fn(),
  };

  let controller: ReservationsController;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new ReservationsController(
      reservationsServiceMock as unknown as ReservationsService,
    );
  });

  it('should create reservation for authenticated user', async () => {
    reservationsServiceMock.create.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      parkingSpaceId: 'space-1',
      status: 'CONFIRMED',
    });

    const request = {
      user: {
        sub: 'user-1',
        email: 'user@test.com',
        role: 'USER',
      },
    } as AuthenticatedRequest;

    const dto = {
      parkingSpaceId: 'space-1',
      startAt: '2026-09-10T12:00:00.000Z',
      endAt: '2026-09-10T14:00:00.000Z',
    };

    const result = await controller.create(
      request,
      dto,
    );

    expect(
      reservationsServiceMock.create,
    ).toHaveBeenCalledWith(
      'user-1',
      dto,
    );

    expect(result).toMatchObject({
      id: 'reservation-1',
      userId: 'user-1',
    });
  });

  it('should return authenticated user reservations', async () => {
    reservationsServiceMock.findMine.mockResolvedValue([
      {
        id: 'reservation-1',
        userId: 'user-1',
      },
    ]);

    const request = {
      user: {
        sub: 'user-1',
        email: 'user@test.com',
        role: 'USER',
      },
    } as unknown as AuthenticatedRequest;

    const result =
      await controller.findMine(request);

    expect(
      reservationsServiceMock.findMine,
    ).toHaveBeenCalledWith(
      'user-1',
    );

    expect(result).toHaveLength(1);
  });

  it('should cancel authenticated user reservation', async () => {
    reservationsServiceMock.cancelMine.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      status: 'CANCELLED',
    });

    const request = {
      user: {
        sub: 'user-1',
        email: 'user@test.com',
        role: 'USER',
      },
    } as unknown as AuthenticatedRequest;

    const result =
      await controller.cancelMine(
        request,
        'reservation-1',
      );

    expect(
      reservationsServiceMock.cancelMine,
    ).toHaveBeenCalledWith(
      'user-1',
      'reservation-1',
    );

    expect(result).toMatchObject({
      status: 'CANCELLED',
    });
  });
  
  it('should return staff reservations', async () => {
    reservationsServiceMock
      .findAllForStaff
      .mockResolvedValue([
        {
          id: 'reservation-1',
          status: 'CONFIRMED',
        },
      ]);

    const query = {
      status: 'CONFIRMED' as const,
    };

    const result =
      await controller.findAllForStaff(
        query,
      );

    expect(
      reservationsServiceMock.findAllForStaff,
    ).toHaveBeenCalledWith(
      query,
    );

    expect(result).toHaveLength(1);
  });
});