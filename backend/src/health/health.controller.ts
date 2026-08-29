import { Controller, Get } from '@nestjs/common';

@Controller('health')               // Nest dekorator, ovaj kontroler obradjuje /health
export class HealthController {

    @Get()                          // HTTP GET
    checkHealth(){
        return {
            status: 'ok',
        };
    }
}
