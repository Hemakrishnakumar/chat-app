import { Controller, Get, UseGuards, Req, Post, Body, Query, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { GetChatsDto } from './dto/get-chats.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('api/v1/chats')
@UseGuards(SessionGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getChats(@Req() req: any, @Query() query: GetChatsDto) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.chatsService.getUserChats(userId, query.cursor, query.limit || 20);
  }

  @Get(':conversationId/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatsService.getMessages(conversationId);
  }

  @Post('direct')
  async createDirect(@Req() req: any, @Body('phone') phone: string) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const targetUser = await this.usersService.findByPhone(phone);
    if (!targetUser) throw new Error('User not found');

    const chatId = await this.chatsService.findOrCreateDirectChat(userId, targetUser.id);

    return { chatId };
  }

  @Post('send-message')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    const senderId = req.user?.userId;

    if (!senderId) {
      throw new Error('User not authenticated');
    }

    const result = await this.chatsService.sendFirstMessage(senderId, dto.recipientId, dto.content);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Message sent',
      data: result,
    };
  }
}
