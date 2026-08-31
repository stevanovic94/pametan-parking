import { Test } from '@nestjs/testing';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { PrismaService } from '../../prisma/prisma.service.js';
import { SessionsService } from './sessions.service.js';

describe('SessionsService', () => {
    let service: SessionsService;

    const prismaMock = {
        session: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    };

    beforeEach(async () => {
        const moduleRef =
            await Test.createTestingModule({
                providers: [
                    SessionsService,
                    {
                        provide: PrismaService,
                        useValue: prismaMock,
                    },
                ],
            }).compile();

        service =
            moduleRef.get<SessionsService>(
                SessionsService,
            );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});