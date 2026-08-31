import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { SecurityModule } from '../security/security.module.js';
import { UsersModule } from '../users/users.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionsService } from './sessions/sessions.service.js';

@Module({
  imports: [
    UsersModule,
    SecurityModule,
    PrismaModule
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    SessionsService
  ],
})
export class AuthModule {}