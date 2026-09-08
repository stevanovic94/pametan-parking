import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthController } from './health/health.controller.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SecurityModule } from './security/security.module.js';
import { ParkingLotsModule } from './parking-lots/parking-lots.module.js';
import { ParkingSpacesModule } from './parking-spaces/parking-spaces.module.js';
import { ReservationsModule } from './reservations/reservations.module.js';
import { AccessControlModule } from './access-control/access-control.module.js';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), PrismaModule, UsersModule, AuthModule, SecurityModule, ParkingLotsModule, ParkingSpacesModule, ReservationsModule, AccessControlModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
