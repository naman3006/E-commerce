import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  root() {
    return {
      success: true,
      message: '🚀 VoxMarket Backend is running successfully',
      timestamp: new Date(),
    };
  }

  @Get('version')
  version() {
    return {
      version: '1.0.1 (Fix Async Email + Chatbot)',
      buildTime: new Date().toISOString(),
      deploymentCheck: 'debug-v2',
    };
  }
}
