import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan, Not, In, DataSource } from 'typeorm';
import { Conversation, ChatType } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { Message, MessageType } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { NEW_CONVERSATION } from './types/socket.events';

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
    private redisService: RedisService,
    private dataSource: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  async getUserConversations(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{ data: ChatResponse[]; nextCursor: string | null }> {

    // Get conversations for user
    const query = this.chatRepo
      .createQueryBuilder('c')
      .innerJoin('conversation_members', 'cm', 'cm.conversation_id = c.id')
      .where('cm.user_id = :userId', { userId })
      .orderBy('c.createdAt', 'DESC')
      .limit(limit + 1);

    if (cursor) {
      query.andWhere('c.createdAt < :cursor', { cursor });
    }

    const conversations = await query.getMany();
    const hasMore = conversations.length > limit;
    const chats = conversations.slice(0, limit);
    const conversationIds = chats.map(c => c.id);

    // Fetch all messages for these conversations
    const messages = await this.messageRepo.find({
      where: { conversationId: In(conversationIds), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    const messagesMap = new Map<string, Message>();
    messages.forEach(msg => {
      if (!messagesMap.has(msg.conversationId)) {
        messagesMap.set(msg.conversationId, msg);
      }
    });

    // Fetch members
    const members = await this.memberRepo.find({
      where: { conversationId: In(conversationIds) },
      relations: ['user'],
    });

    const membersMap = new Map<string, any[]>();
    members.forEach(member => {
      if (!membersMap.has(member.conversationId)) {
        membersMap.set(member.conversationId, [member]);
      } else {
        const membersList = membersMap.get(member.conversationId);
        if (membersList) {
          membersList.push(member);
        }
      }
    });

    // Fetch user's join time for each conversation
    const memberRecords = await this.memberRepo.find({
      where: { userId, conversationId: In(conversationIds) },
    });

    const lastReadMap = new Map<string, Date | null>();
    memberRecords.forEach(m => {
      lastReadMap.set(m.conversationId, m.joinedAt || null);
    });

    // Build response
    const chatResponses: ChatResponse[] = await Promise.all(
      chats.map(async (conversation) => {
        const lastMessage = messagesMap.get(conversation.id) || null;

        let chatName = conversation.name;
        let avatarUrl: string | null = null;

        if (conversation.type === ChatType.DIRECT) {
          const membersList = membersMap.get(conversation.id) || [];
          const other = membersList.find(m => m.userId !== userId);

          if (other) {
            chatName = other.user.name;
            avatarUrl = other.user.photo_url;
          }
        }

        const lastReadAt = lastReadMap.get(conversation.id);
        let unreadCount = 0;

        if (lastReadAt) {
          unreadCount = await this.messageRepo.count({
            where: {
              conversationId: conversation.id,
              createdAt: MoreThan(lastReadAt),
              senderId: Not(userId),
              deletedAt: IsNull(),
            },
          });
        } else {
          unreadCount = await this.messageRepo.count({
            where: {
              conversationId: conversation.id,
              senderId: Not(userId),
              deletedAt: IsNull(),
            },
          });
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

    const nextCursor = hasMore
      ? chatResponses[chatResponses.length - 1].updatedAt.toISOString()
      : null;

    return {
      data: chatResponses,
      nextCursor,
    };
  }

  async createConversationWithMessage(
    senderId: string,
    participantIds: string[],
    content: string,
    name?: string,
    type: ChatType = ChatType.DIRECT
  ) {
    const result = await this.dataSource.transaction(async (manager) => {

      const uniqueParticipantIds = Array.from(new Set(participantIds));
      const allMembers = Array.from(new Set([senderId, ...uniqueParticipantIds]));

      const users = await manager
        .createQueryBuilder(User, 'user')
        .where('user.id IN (:...ids)', { ids: allMembers })
        .select(['user.id', 'user.name', 'user.photo_url'])
        .getMany();

      if (users.length !== allMembers.length) {
        throw new Error('One or more users do not exist');
      }

      if (type === ChatType.DIRECT && participantIds.length !== 1) {
        throw new Error('Direct chat must have exactly one participant');
      }

      if (type === ChatType.GROUP && allMembers.length < 3) {
        throw new Error('Group chat must have at least 3 members');
      }

      let conversation: Conversation | null = null;

      if (type === ChatType.DIRECT) {
        const otherUserId = participantIds[0];

        const existing = await manager
          .createQueryBuilder(Conversation, 'c')
          .innerJoin(
            ConversationMember,
            'm1',
            'm1.conversationId = c.id AND m1.userId = :senderId',
            { senderId },
          )
          .innerJoin(
            ConversationMember,
            'm2',
            'm2.conversationId = c.id AND m2.userId = :otherUserId',
            { otherUserId },
          )
          .where('c.type = :type', { type: ChatType.DIRECT })
          .getOne();

        if (existing) {
          conversation = existing;
        }
      }

      if (!conversation) {
        const newConversation = manager.create(Conversation, {
          type,
          name: type === ChatType.GROUP ? name : undefined,
          createdById: senderId,
        });

        conversation = await manager.save(newConversation);


        const members = allMembers.map((userId) =>
          manager.create(ConversationMember, {
            conversationId: conversation?.id,
            userId,
          }),
        );

        await manager.save(members);
      }

      const message = manager.create(Message, {
        conversationId: conversation?.id,
        senderId,
        content,
        type: MessageType.TEXT,
      });

      const savedMessage = await manager.save(message);

      await manager.update(Conversation, conversation.id, {
        lastMessageId: savedMessage.id,
      });

      return {
        conversation,
        message: savedMessage,
        users
      };
    });

    await this.redisService.publish(NEW_CONVERSATION, result);

    return { conversation: result.conversation, message: result.message };
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const message = await this.messageRepo.save({
      conversationId,
      senderId,
      content,
      type: MessageType.TEXT,
    });
    await this.chatRepo.update(conversationId, {
      lastMessageId: message.id,
    });

    return message;
  }

  async getMessages(userId: string, conversationId: string, cursor?: string, limit?: Number) {
    return this.messageRepo.find({
      where: { conversationId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }

  async updateMemberJoinedAt(userId: string, conversationId: string) {
    await this.memberRepo.update(
      { userId, conversationId },
      { joinedAt: new Date() }
    );
  }

  async getConversationMembers(conversationId: string) {
    const members = await this.memberRepo.find({
      where: { conversationId },
      relations: ['user']
    });
    return members;
  }

  async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    const member = await this.memberRepo.findOne({
      where: { userId, conversationId },
    });

    if (!member) return 0;

    const lastReadAt = member.joinedAt;

    if (lastReadAt) {
      return this.messageRepo.count({
        where: {
          conversationId,
          createdAt: MoreThan(lastReadAt),
          senderId: Not(userId),
          deletedAt: IsNull(),
        },
      });
    } else {
      return this.messageRepo.count({
        where: {
          conversationId,
          senderId: Not(userId),
          deletedAt: IsNull(),
        },
      });
    }
  }
}
