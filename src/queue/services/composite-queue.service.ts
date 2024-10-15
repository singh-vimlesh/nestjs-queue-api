import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../interfaces/queue-service.interface';
import { QueueServiceNames } from '../../common/enums/queue-service-names.enum';

@Injectable()
export class CompositeQueueService implements QueueService {
  private readonly logger = new Logger(CompositeQueueService.name);

  constructor(private readonly queueServices: QueueService[]) {}

  private filterServices(
    queueServiceNames?: QueueServiceNames[],
  ): QueueService[] {
    if (!queueServiceNames || queueServiceNames.length === 0) {
      return this.queueServices;
    }
    return this.queueServices.filter((service) =>
      queueServiceNames.includes(service.constructor.name as QueueServiceNames),
    );
  }

  async publishMessage(
    message: string,
    queueServiceNames?: QueueServiceNames[],
  ): Promise<void> {
    try {
      const servicesToPublish = this.filterServices(queueServiceNames);
      await Promise.all(
        servicesToPublish.map(async (service) => {
          try {
            await service.publishMessage(message);
            this.logger.log(
              `Message sent to ${service.constructor.name}: ${message}`,
            );
          } catch (error) {
            this.logger.error(
              `Error sending message to ${service.constructor.name}: ${error}`,
            );
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Error in publishing message: ${error}`);
    }
  }

  async subscribeMessage(
    queueServiceNames?: QueueServiceNames[],
  ): Promise<any[]> {
    try {
      const servicesToSubscribe = this.filterServices(queueServiceNames);
      const results = await Promise.all(
        servicesToSubscribe.map(async (service) => {
          try {
            const messages = await service.subscribeMessage();
            this.logger.log(
              `Subscribed to messages from ${service.constructor.name}`,
            );
            return messages;
          } catch (error) {
            this.logger.error(
              `Error subscribing to messages from ${service.constructor.name}: ${error}`,
            );
            return [];
          }
        }),
      );
      return results.flat();
    } catch (error) {
      this.logger.error(`Error in subscribing to messages: ${error}`);
      return [];
    }
  }
}
