import { Injectable } from '@nestjs/common';
import { QueueService } from '../interfaces/queue-service.interface';
import { SQSService } from '../services/sqs.service';
import { RabbitMQService } from '../services/rabbitmq.service';

@Injectable()
export class QueueFactory {
  static createQueueServices(): QueueService[] {
    const queueProviders = process.env.QUEUE_PROVIDERS?.split(',') || [];

    const services: QueueService[] = [];

    if (queueProviders.includes('SQS')) {
      services.push(new SQSService());
    }

    if (queueProviders.includes('RABBITMQ')) {
      services.push(new RabbitMQService());
    }

    if (services.length === 0) {
      throw new Error('No valid queue provider specified.');
    }

    return services;
  }
}
