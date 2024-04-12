import { Module } from '@nestjs/common';
import { MessagesService } from './application/messages.service';
import { MessagesController } from './api/messages.controller';
import { EventsGateway } from '../events/events.gateway';
import { MessagesRepo } from './infrastructure/messages.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesEntity } from './entities/messages.entity';
import { ConversationsRepo } from './infrastructure/conversations.repo';
import { ConversationsEntity } from './entities/conversations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessagesEntity, ConversationsEntity])],
  controllers: [MessagesController],
  providers: [MessagesService, ConversationsRepo, MessagesRepo, EventsGateway],
})
export class MessagesModule {}
