import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module.js';
import { UsersModule } from '../users/users.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    UsersModule,
    SecurityModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
  ],
})
export class AuthModule {}