import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
@ApiTags('Health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns app health status',
    schema: {
      example: {
        statusCode: 200,
        message: 'Success',
        data: 'Hello World!',
        timestamp: '2026-08-31T12:00:00.000Z',
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
