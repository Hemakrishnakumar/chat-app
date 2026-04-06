import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { Message } from './entities/message.entity';
import { MessageReceipt } from './entities/message-status.entity';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { ChatsController } from './chat.controller';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationMember, Message, MessageReceipt, User]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatsModule {}
