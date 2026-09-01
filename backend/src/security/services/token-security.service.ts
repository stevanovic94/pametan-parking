import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TokenSecurityService {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    // da li je konkretan JWT opozvan
    async isAccessTokenBlacklisted(
        jti: string,
    ): Promise<boolean> {

        const revokedToken =
            await this.prisma.revokedAccessToken.findUnique({
                where: {
                    jti,
                },
            });

        if (!revokedToken) {
            return false;
        }

        return revokedToken.expiresAt > new Date();
    }

    // da li njegova login sesija još postoji i nije revoked
    async isSessionActive(
        sessionId: string,
        userId: string,
    ): Promise<boolean> {

        const session =
            await this.prisma.session.findFirst({
                where: {
                    id: sessionId,
                    userId,
                    revokedAt: null,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
                select: {
                    id: true,
                },
            });

        return session !== null;
    }

    // ugasi sesiju i stavi token na blacklist
    async logoutSession(data: {
        sessionId: string;
        userId: string;
        jti: string;
        tokenExpiresAt: Date;
    }): Promise<void> {

        // $transaction - dve povezane DB operacije, jedna logicka transakcija
        // (ili uspevaju obe, ili nijedna)
        await this.prisma.$transaction([
            this.prisma.session.updateMany({
                where: {
                    id: data.sessionId,
                    userId: data.userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            }),

            this.prisma.revokedAccessToken.upsert({
                where: {
                    jti: data.jti,
                },
                update: {
                    expiresAt: data.tokenExpiresAt,
                },
                create: {
                    jti: data.jti,
                    userId: data.userId,
                    expiresAt: data.tokenExpiresAt,
                },
            }),
        ]);
    }
}