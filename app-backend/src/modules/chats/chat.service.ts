import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chat-member.entity';
import { Message } from './entities/message.entity';
import { MessageStatus } from './entities/message-status.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember) private memberRepo: Repository<ChatMember>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(MessageStatus)
    private statusRepo: Repository<MessageStatus>,
  ) {}

  async getUserChats(userId: string) {
    return this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat_members', 'cm', 'cm.chatId = chat.id')
      .where('cm.userId = :userId', { userId })
      .getMany();
  }

  async findOrCreateDirectChat(userA: string, userB: string) {
    const existingChat = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin(
        'chat_members',
        'm1',
        'm1.chatId = chat.id AND m1.userId = :userA',
        { userA },
      )
      .innerJoin(
        'chat_members',
        'm2',
        'm2.chatId = chat.id AND m2.userId = :userB',
        { userB },
      )
      .where('chat.type = :type', { type: 'direct' })
      .getOne();

    if (existingChat) {
      return existingChat.id;
    }

    // create new direct chat
    const chat = await this.chatRepo.save({});

    await this.memberRepo.save([
      { chatId: chat.id, userId: userA },
      { chatId: chat.id, userId: userB },
    ]);

    return chat.id;
  }

  async saveMessage(chatId: string, senderId: string, content: string) {
    const message = await this.messageRepo.save({
      chatId,
      senderId,
      content,
    });

    const members = await this.memberRepo.find({ where: { chatId } });

    const statuses = members.map((m) => ({
      messageId: message.id,
      userId: m.userId,
      deliveredAt: m.userId === senderId ? new Date() : null,
    }));

    //await this.statusRepo.save(statuses);

    return message;
  }

  async getMessages(chatId: string) {
    return this.messageRepo.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
  }
}
