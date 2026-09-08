import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SecurityModule } from '../security/security.module.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
  ],
  controllers: [
    ReservationsController,
  ],
  providers: [
    ReservationsService,
  ],
  exports: [
    ReservationsService,
  ],
})
export class ReservationsModule { }