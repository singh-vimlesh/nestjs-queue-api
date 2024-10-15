import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueFactory } from './factories/queue.factory';
import { CompositeQueueService } from './services/composite-queue.service';

@Module({
  controllers: [QueueController],
  providers: [
    {
      provide: 'QueueServices',
      useFactory: () => {
        const queueServices = QueueFactory.createQueueServices();
        return new CompositeQueueService(queueServices);
      },
    },
  ],
  exports: ['QueueServices'],
})
export class QueueModule {}
