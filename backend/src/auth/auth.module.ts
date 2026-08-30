import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  imports: [
    UsersModule,

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
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    JwtAuthGuard
  ],
})
export class AuthModule {}