import { Test } from '@nestjs/testing';

import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { PrismaService } from '../../prisma/prisma.service.js';
import { TokenSecurityService } from './token-security.service.js';

describe('TokenSecurityService', () => {
    let service: TokenSecurityService;

    const prismaMock = {
        revokedAccessToken: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
        },

        session: {
            findFirst: vi.fn(),
            updateMany: vi.fn(),
        },

        $transaction: vi.fn(),
    };

    beforeEach(async () => {
        const moduleRef =
            await Test.createTestingModule({
                providers: [
                    TokenSecurityService,
                    {
                        provide: PrismaService,
                        useValue: prismaMock,
                    },
                ],
            }).compile();

        service =
            moduleRef.get<TokenSecurityService>(
                TokenSecurityService,
            );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});