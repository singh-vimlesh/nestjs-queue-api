import { Controller, Get } from '@nestjs/common';

export const ROOT_MESSAGE = 'Welcome to the Nest Queue API!';

@Controller()
export class AppController {
  @Get()
  getRootMessage() {
    return ROOT_MESSAGE;
  }

  @Get('health')
  checkHealth() {
    return { status: 'Healthy' };
  }
}
