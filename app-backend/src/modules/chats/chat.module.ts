import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chat-member.entity';
import { Message } from './entities/message.entity';
import { MessageStatus } from './entities/message-status.entity';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { ChatsController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, Message, MessageStatus]),
    UsersModule,
  ],
  controllers: [ChatsController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatsModule {}
