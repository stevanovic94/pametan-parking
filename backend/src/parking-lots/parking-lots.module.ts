import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SecurityModule } from '../security/security.module.js';
import { ParkingLotsService } from './parking-lots.service.js';
import { ParkingLotsController } from './parking-lots.controller.js';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
  ],

  controllers: [
    ParkingLotsController,
  ],

  providers: [
    ParkingLotsService,
  ],

  exports: [
    ParkingLotsService,
  ],
})
export class ParkingLotsModule { }
