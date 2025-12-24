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
}
