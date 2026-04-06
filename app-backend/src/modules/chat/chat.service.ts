import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Conversation, ChatType } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { Message, MessageType } from './entities/message.entity';
import { MessageReceipt } from './entities/message-status.entity';
import { User } from '../users/entities/user.entity';

export interface ChatResponse {
  id: string;
  type: ChatType;
  name: string;
  avatarUrl: string | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    type: string;
  } | null;
  unreadCount: number;
  updatedAt: Date;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private chatRepo: Repository<Conversation>,
    @InjectRepository(ConversationMember) private memberRepo: Repository<ConversationMember>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(MessageReceipt)
    private statusRepo: Repository<MessageReceipt>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getUserChats(userId: string, cursor?: string, limit: number = 20): Promise<{ data: ChatResponse[]; nextCursor: string | null }> {
    // Get all conversations for the user
    const query = this.chatRepo
      .createQueryBuilder('conversation')
      .innerJoin(
        'conversation_members',
        'cm',
        'cm.conversation_id = conversation.id',
      )
      .where('cm.user_id = :userId', { userId })
      .orderBy('conversation.createdAt', 'DESC');

    if (cursor) {
      query.andWhere('conversation.createdAt < :cursor', { cursor });
    }

    const conversations = await query.take(limit + 1).getMany();

    const hasMore = conversations.length > limit;
    const chats = conversations.slice(0, limit);

    const chatResponses: ChatResponse[] = await Promise.all(
      chats.map(async (conversation) => {
        // Get last message
        const lastMessage = await this.messageRepo.findOne({
          where: { conversationId: conversation.id, deletedAt: IsNull() },
          order: { createdAt: 'DESC' },
        });

        // Get unread count
        const unreadCount = lastMessage
          ? await this.messageRepo.count({
              where: {
                conversationId: conversation.id,
                createdAt: lastMessage.createdAt,
              },
            })
          : 0;

        // Get chat name and avatar
        let chatName = conversation.name;
        let avatarUrl: string | null = null;

        if (conversation.type === ChatType.DIRECT) {
          // For direct chats, get the other user's name
          const members = await this.memberRepo.find({
            where: { conversationId: conversation.id },
            relations: ['user'],
          });

          const otherMember = members.find((m) => m.userId !== userId);
          if (otherMember) {
            chatName = otherMember.user.name;
            avatarUrl = otherMember.user.photo_url;
          }
        }

        return {
          id: conversation.id,
          type: conversation.type,
          name: chatName,
          avatarUrl,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
                type: lastMessage.type,
              }
            : null,
          unreadCount,
          updatedAt: lastMessage?.createdAt || conversation.createdAt,
        };
      }),
    );

    const nextCursor = hasMore ? chats[chats.length - 1].createdAt.toISOString() : null;

    return {
      data: chatResponses,
      nextCursor,
    };
  }

  async findOrCreateDirectChat(userA: string, userB: string) {
    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin(
        'conversation_members',
        'm1',
        'm1.conversation_id = chat.id AND m1.user_id = :userA',
        { userA },
      )
      .innerJoin(
        'conversation_members',
        'm2',
        'm2.conversation_id = chat.id AND m2.user_id = :userB',
        { userB },
      )
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .getOne();

    if (existingChat) {
      return existingChat.id;
    }

    // create new direct chat
    const chat = await this.chatRepo.save({
      type: ChatType.DIRECT,
      createdById: userA,
    });

    await this.memberRepo.save([
      { conversationId: chat.id, userId: userA },
      { conversationId: chat.id, userId: userB },
    ]);

    return chat.id;
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const message = await this.messageRepo.save({
      conversationId,
      senderId,
      content,
      type: MessageType.TEXT,
    });

    const members = await this.memberRepo.find({ where: { conversationId } });

    const statuses = members.map((m) => ({
      messageId: message.id,
      userId: m.userId,
      deliveredAt: m.userId === senderId ? new Date() : null,
    }));

    return message;
  }

  async sendFirstMessage(senderId: string, recipientId: string, content: string) {
    // Find or create direct conversation
    const conversationId = await this.findOrCreateDirectChat(senderId, recipientId);

    // Save the message
    const message = await this.saveMessage(conversationId, senderId, content);

    // Update conversation's lastMessageId
    await this.chatRepo.update(conversationId, {
      lastMessageId: message.id,
    });

    return {
      conversationId,
      message,
    };
  }

  async getMessages(conversationId: string) {
    return this.messageRepo.find({
      where: { conversationId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }
}
