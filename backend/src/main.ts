import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');   // Postavlja globalni prefiks za sve rute na 
                                // /api, tako da ce sve rute biti  
                                // dostupne na /api/ime_rute

  app.enableVersioning({        // Omogucava verzionisanje API-ja, 
    type: VersioningType.URI,   // tako da ce sve rute biti dostupne na 
    defaultVersion: '1',        // /api/v1/ime_rute
  });

  app.useGlobalPipes(new ValidationPipe({ // Omogucava validaciju podataka
    whitelist: true,                     // tako da ce se odbaciti svi podaci koji nisu definisani u DTO-ima  
    forbidNonWhitelisted: true,          // i bice vracena greska ako se pokusa poslati nevalidan podatak
    transform: true,                     // i omogucava automatsko transformisanje podataka u odgovarajuce tipove  
   }),
  );

  app.enableCors({ // Omogucava CORS (Cross-Origin Resource Sharing) tako da frontend moze da pristupi backend-u
    origin: configService.get<string>('FRONTEND_URL'), // Dozvoljava pristup samo sa frontend URL-a definisanog u .env fajlu
  });

  const port = configService.get<number>('PORT') ?? 3000; // Uzimamo port iz .env fajla, a ako nije definisan, koristi se podrazumevani port 3000
  
  await app.listen(port);
}
void bootstrap();
