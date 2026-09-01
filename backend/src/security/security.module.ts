import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

import { PrismaModule } from '../prisma/prisma.module.js';

import { TokenSecurityService } from './services/token-security.service.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [
        ConfigService,
      ],

      useFactory: (configService: ConfigService) => ({
        secret:
          configService.getOrThrow<string>(
            'JWT_ACCESS_SECRET',
          ),

        signOptions: {
          expiresIn: Number(
            configService.get<string>(
              'JWT_ACCESS_EXPIRES_IN_SECONDS',
            ) ?? '900',
          ),
        },
      }),
    }),
  ],

  providers: [
    JwtAuthGuard,
    RolesGuard,
    TokenSecurityService,
  ],

  exports: [
    JwtModule,
    JwtAuthGuard,
    RolesGuard,
    TokenSecurityService,
  ],
})
export class SecurityModule {}