import { QueueServiceNames } from 'src/common/enums/queue-service-names.enum';

export interface QueueService {
  publishMessage(
    message: string,
    queueServiceNames?: QueueServiceNames[],
  ): Promise<void>;
  subscribeMessage(queueServiceNames?: QueueServiceNames[]): Promise<any[]>;
}
