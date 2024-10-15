import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  CreateQueueCommand,
  GetQueueUrlCommand,
  SQSServiceException,
} from '@aws-sdk/client-sqs';
import { QueueService } from '../interfaces/queue-service.interface';

const MAX_NUMBER_OF_MESSAGES = 5;
const WAIT_TIME_SECONDS = 10;

const DELAY_SECONDS = '0';
const MESSAGE_RETENTION_PERIOD_IN_SECONDS = '86400'; // 1 day
const VISIBILITY_TIMEOUT_IN_SECONDS = '30';

@Injectable()
export class SQSService implements QueueService {
  private sqsClient: SQSClient;
  private readonly logger = new Logger(SQSService.name);
  private queueUrl: string;

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.SQS_ENDPOINT,
    });
    this.validateConfiguration();
    this.initQueue(process.env.SQS_QUEUE_NAME);
  }

  private validateConfiguration(): void {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new Error(
        'Missing AWS configuration. Please check your environment variables.',
      );
    }

    if (!process.env.SQS_QUEUE_NAME) {
      throw new Error('SQS_QUEUE_NAME is not defined.');
    }
  }

  private async initQueue(queueName: string): Promise<void> {
    try {
      const getQueueUrlCommand = new GetQueueUrlCommand({
        QueueName: queueName,
      });
      const response = await this.sqsClient.send(getQueueUrlCommand);
      this.queueUrl = response.QueueUrl;
      this.logger.log(`Using existing queue: ${this.queueUrl}`);
    } catch (error) {
      if (
        error instanceof SQSServiceException &&
        error.name === 'QueueDoesNotExist'
      ) {
        this.logger.log(
          `Queue does not exist. Attempting to create queue: ${queueName}`,
        );
        await this.createQueue(queueName);
      } else {
        this.handleSQSError(error, 'initializing queue');
      }
    }
  }

  async createQueue(queueName: string): Promise<void> {
    const params = {
      QueueName: queueName,
      Attributes: {
        DelaySeconds: DELAY_SECONDS,
        MessageRetentionPeriod: MESSAGE_RETENTION_PERIOD_IN_SECONDS,
        VisibilityTimeout: VISIBILITY_TIMEOUT_IN_SECONDS,
      },
    };

    const command = new CreateQueueCommand(params);
    try {
      const data = await this.sqsClient.send(command);
      this.queueUrl = data.QueueUrl;
      this.logger.log(`Success, created queue. URL: ${this.queueUrl}`);
    } catch (error) {
      this.handleSQSError(error, 'creating queue');
    }
  }

  async publishMessage(message: string): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: message,
    };

    const command = new SendMessageCommand(params);
    try {
      await this.sqsClient.send(command);
      this.logger.log(`Message sent to SQS: ${message}`);
    } catch (error) {
      this.handleSQSError(error, 'publishing message');
    }
  }

  async subscribeMessage(): Promise<any[]> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES,
      WaitTimeSeconds: WAIT_TIME_SECONDS,
    };

    const command = new ReceiveMessageCommand(params);
    try {
      const response = await this.sqsClient.send(command);
      const messages = [];

      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          this.logger.log(`Received SQS message: ${message.Body}`);
          messages.push(message.Body);
          await this.deleteMessage(message.ReceiptHandle);
        }
      } else {
        this.logger.log('No messages received');
      }

      return messages;
    } catch (error) {
      this.handleSQSError(error, 'subscribing to messages');
      return [];
    }
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };
    const command = new DeleteMessageCommand(params);
    try {
      await this.sqsClient.send(command);
      this.logger.log('Message deleted from SQS');
    } catch (error) {
      this.handleSQSError(error, 'deleting message');
    }
  }

  private handleSQSError(error: unknown, operation: string): void {
    if (error instanceof SQSServiceException) {
      this.logger.error(`Error ${operation}: ${error.message}`);
    } else if (error instanceof Error) {
      this.logger.error(`Error ${operation}: ${error.message}`);
    } else {
      this.logger.error(
        `Unexpected error ${operation}: ${JSON.stringify(error)}`,
      );
    }
  }
}
