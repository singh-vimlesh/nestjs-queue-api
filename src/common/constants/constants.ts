export const QUEUE_NAMES = {
  SQS_QUEUE:
    process.env.SQS_URL || 'http://localhost:4566/000000000000/my-queue',
  RABBITMQ_QUEUE: 'rabbitmq_queue',
};
