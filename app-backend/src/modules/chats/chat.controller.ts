import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getChats(@Req() req: any) {
    return this.chatsService.getUserChats(req.user.userId);
  }

  @Post('direct')
  async createDirect(@Req() req: any, @Body('phone') phone: string) {
    const targetUser = await this.usersService.findByPhone(phone);
    if (!targetUser) throw new Error('User not found');

    const chatId = await this.chatsService.findOrCreateDirectChat(
      req.user.userId,
      targetUser.id,
    );

    return { chatId };
  }
}
