import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ReservationsService } from './reservations.service.js';

describe('ReservationsService', () => {
  const txMock = {
    parkingSpace: {
      findFirst: vi.fn(),
    },
    reservation: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };

  const prismaMock = {
    $transaction: vi.fn(),
    reservation: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };

  let service: ReservationsService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(
      new Date('2026-09-08T09:00:00.000Z'),
    );

    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(
      async (
        callback: (tx: typeof txMock) => Promise<unknown>,
      ) => callback(txMock),
    );

    service = new ReservationsService(
      prismaMock as never,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create valid reservation', async () => {
    txMock.parkingSpace.findFirst.mockResolvedValue({
      id: 'space-1',
    });

    txMock.reservation.findFirst.mockResolvedValue(null);

    txMock.reservation.create.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      parkingSpaceId: 'space-1',
      startAt: new Date('2026-09-10T12:00:00.000Z'),
      endAt: new Date('2026-09-10T14:00:00.000Z'),
      status: 'CONFIRMED',
    });

    const result = await service.create(
      'user-1',
      {
        parkingSpaceId: 'space-1',
        startAt: '2026-09-10T12:00:00.000Z',
        endAt: '2026-09-10T14:00:00.000Z',
      },
    );

    expect(result).toMatchObject({
      id: 'reservation-1',
      userId: 'user-1',
      parkingSpaceId: 'space-1',
      status: 'CONFIRMED',
    });

    expect(
      txMock.reservation.create,
    ).toHaveBeenCalledOnce();
  });

  it('should reject start time equal to end time', async () => {
    await expect(
      service.create(
        'user-1',
        {
          parkingSpaceId: 'space-1',
          startAt: '2026-09-10T12:00:00.000Z',
          endAt: '2026-09-10T12:00:00.000Z',
        },
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(
      prismaMock.$transaction,
    ).not.toHaveBeenCalled();
  });

  it('should reject start time after end time', async () => {
    await expect(
      service.create(
        'user-1',
        {
          parkingSpaceId: 'space-1',
          startAt: '2026-09-10T15:00:00.000Z',
          endAt: '2026-09-10T14:00:00.000Z',
        },
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should reject reservation in the past', async () => {
    await expect(
      service.create(
        'user-1',
        {
          parkingSpaceId: 'space-1',
          startAt: '2026-09-01T12:00:00.000Z',
          endAt: '2026-09-01T13:00:00.000Z',
        },
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should reject unavailable parking space', async () => {
    txMock.parkingSpace.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        'user-1',
        {
          parkingSpaceId: 'space-1',
          startAt: '2026-09-10T12:00:00.000Z',
          endAt: '2026-09-10T14:00:00.000Z',
        },
      ),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(
      txMock.reservation.create,
    ).not.toHaveBeenCalled();
  });

  it('should reject overlapping reservation', async () => {
    txMock.parkingSpace.findFirst.mockResolvedValue({
      id: 'space-1',
    });

    txMock.reservation.findFirst.mockResolvedValue({
      id: 'reservation-existing',
    });

    await expect(
      service.create(
        'user-1',
        {
          parkingSpaceId: 'space-1',
          startAt: '2026-09-10T13:00:00.000Z',
          endAt: '2026-09-10T15:00:00.000Z',
        },
      ),
    ).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(
      txMock.reservation.create,
    ).not.toHaveBeenCalled();
  });

  it('should allow adjacent reservation', async () => {
    txMock.parkingSpace.findFirst.mockResolvedValue({
      id: 'space-1',
    });

    txMock.reservation.findFirst.mockResolvedValue(null);

    txMock.reservation.create.mockResolvedValue({
      id: 'reservation-2',
      userId: 'user-1',
      parkingSpaceId: 'space-1',
      startAt: new Date('2026-09-10T14:00:00.000Z'),
      endAt: new Date('2026-09-10T15:00:00.000Z'),
      status: 'CONFIRMED',
    });

    const result = await service.create(
      'user-1',
      {
        parkingSpaceId: 'space-1',
        startAt: '2026-09-10T14:00:00.000Z',
        endAt: '2026-09-10T15:00:00.000Z',
      },
    );

    expect(result).toMatchObject({
      id: 'reservation-2',
      status: 'CONFIRMED',
    });
  });

  it('should return only authenticated user reservations', async () => {
    prismaMock.reservation.findMany.mockResolvedValue([
      {
        id: 'reservation-1',
        userId: 'user-1',
        status: 'CONFIRMED',
      },
    ]);

    const result =
      await service.findMine('user-1');

    expect(
      prismaMock.reservation.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
        },
      }),
    );

    expect(result).toHaveLength(1);
  });

  it('should cancel own confirmed reservation', async () => {
    prismaMock.reservation.findFirst.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      status: 'CONFIRMED',
    });

    prismaMock.reservation.update.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      status: 'CANCELLED',
    });

    const result =
      await service.cancelMine(
        'user-1',
        'reservation-1',
      );

    expect(
      prismaMock.reservation.update,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'reservation-1',
        },
        data: {
          status: 'CANCELLED',
        },
      }),
    );

    expect(result).toMatchObject({
      status: 'CANCELLED',
    });
  });

  it('should reject reservation that does not belong to user', async () => {
    prismaMock.reservation.findFirst.mockResolvedValue(null);

    await expect(
      service.cancelMine(
        'user-1',
        'reservation-2',
      ),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(
      prismaMock.reservation.update,
    ).not.toHaveBeenCalled();
  });

  it('should reject cancelling non-confirmed reservation', async () => {
    prismaMock.reservation.findFirst.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      status: 'CANCELLED',
    });

    await expect(
      service.cancelMine(
        'user-1',
        'reservation-1',
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should return staff reservations with filters', async () => {
    prismaMock.reservation.findMany.mockResolvedValue([
      {
        id: 'reservation-1',
        status: 'CONFIRMED',
      },
    ]);

    const result =
      await service.findAllForStaff({
        parkingLotId: 'parking-1',
        status: 'CONFIRMED',
      });

    expect(
      prismaMock.reservation.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'CONFIRMED',
          parkingSpace: {
            parkingLotId: 'parking-1',
          },
        },
      }),
    );

    expect(result).toHaveLength(1);
  });

});