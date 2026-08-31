import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SessionsService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create(data: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.session.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.session.findUnique({
      where: {
        id,
      },
    });
  }

  rotateRefreshToken(
    id: string,
    refreshTokenHash: string,
  ) {
    return this.prisma.session.update({
      where: {
        id,
      },
      data: {
        refreshTokenHash,
      },
    });
  }

  revoke(id: string) {
    return this.prisma.session.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}