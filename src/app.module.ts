import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { AppConfigModule } from './config/config.module';
import { AppController } from './app.controller';

@Module({
  imports: [AppConfigModule, QueueModule],
  controllers: [AppController],
})
export class AppModule {}
