import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root Welcome Endpoint' })
  getSystemStatus() {
    return {
      name: 'Airth Mini Job Queue API',
      status: 'online',
      message: 'Backend server is running successfully',
      documentation: '/api/docs',
      endpoints: {
        jobs: '/jobs',
        statusCounts: '/jobs/counts',
      },
    };
  }
}
