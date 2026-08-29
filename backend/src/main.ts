import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');   // Postavlja globalni prefiks za sve rute na 
                                // /api, tako da ce sve rute biti  
                                // dostupne na /api/ime_rute

  app.enableVersioning({        // Omogucava verzionisanje API-ja, 
    type: VersioningType.URI,   // tako da ce sve rute biti dostupne na 
    defaultVersion: '1',        // /api/v1/ime_rute
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
