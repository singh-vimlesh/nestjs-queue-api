import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { QueueService } from '../interfaces/queue-service.interface';
import * as amqp from 'amqplib';
import { QUEUE_NAMES } from '../../common/constants/constants';

const CONNECTION_RETRY_MILLISECONDS = 5000;
const MAX_MESSAGES_STORAGE_LIMIT = 100;

@Injectable()
export class RabbitMQService implements QueueService, OnModuleDestroy {
  private channel: amqp.Channel;
  private connection: amqp.Connection;
  private queue = QUEUE_NAMES.RABBITMQ_QUEUE;
  private readonly logger = new Logger(RabbitMQService.name);
  private messages: string[] = [];
  private readonly maxMessages = MAX_MESSAGES_STORAGE_LIMIT;

  constructor() {
    this.connect();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://localhost',
      );
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queue, { durable: true });
      this.logger.log('Connected to RabbitMQ');
      this.startConsuming();
    } catch (error) {
      this.handleError(error, 'connecting to RabbitMQ');
      setTimeout(() => this.connect(), CONNECTION_RETRY_MILLISECONDS);
    }
  }

  private startConsuming() {
    this.channel.consume(
      this.queue,
      (message) => {
        if (message) {
          const msgContent = message.content.toString();
          this.logger.log('Received RabbitMQ message:', msgContent);
          this.messages.push(msgContent);

          if (this.messages.length > this.maxMessages) {
            this.messages.shift();
            this.logger.warn(
              'Message storage limit exceeded; oldest message removed',
            );
          }

          this.channel.ack(message);
        }
      },
      { noAck: false },
    );
  }

  async publishMessage(message: string): Promise<void> {
    if (!this.channel) {
      this.logger.error('Channel is not established. Cannot publish message.');
      return;
    }

    try {
      const isSent = this.channel.sendToQueue(
        this.queue,
        Buffer.from(message),
        { persistent: true },
      );

      if (isSent) {
        this.logger.log('Message sent to RabbitMQ:', message);
      } else {
        this.logger.warn('Message could not be sent to RabbitMQ');
      }
    } catch (error) {
      this.handleError(error, 'publishing message');
    }
  }

  async subscribeMessage(): Promise<string[]> {
    const collectedMessages = [...this.messages];
    this.messages = [];
    return collectedMessages;
  }

  private handleError(error: unknown, operation: string): void {
    this.logger.error(
      `Error ${operation}: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error) {
      this.logger.debug('Stack Trace:', error.stack);
    }
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('RabbitMQ channel closed');
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('RabbitMQ connection closed');
      }
    } catch (error) {
      this.logger.error('Error during RabbitMQ cleanup:', error);
    }
  }
}
