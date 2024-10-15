import { Controller, Post, Body, Inject, Get } from '@nestjs/common';
import { QueueService } from './interfaces/queue-service.interface';
import { QueueServiceNames } from '../common/enums/queue-service-names.enum';

@Controller('queue')
export class QueueController {
  constructor(
    @Inject('QueueServices')
    private readonly compositeQueueService: QueueService,
  ) {}

  @Post('publish')
  async publish(
    @Body('message') message: string,
    @Body('queues') queues?: QueueServiceNames[],
  ) {
    await this.compositeQueueService.publishMessage(message, queues);
    return { message: `Message published to specified queues` };
  }

  @Get('subscribe')
  async subscribe(@Body('queues') queues?: QueueServiceNames[]) {
    const messages = await this.compositeQueueService.subscribeMessage(queues);
    return {
      message: 'Subscribed and received messages from specified queues',
      data: messages,
    };
  }
}
