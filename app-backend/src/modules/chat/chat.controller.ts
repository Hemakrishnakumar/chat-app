import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetChatsDto } from './dto/get-chats.dto';
// import { GetMessagesDto } from './dto/get-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';
// import { CreateConversationDto } from './dto/create-conversation.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import { GetMessagesDto } from './dto/get-messages-dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('api/v1/conversations')
@UseGuards(SessionGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatService) {}

  // 🔹 Conversation List
  @Get()
  @HttpCode(HttpStatus.OK)
  async getConversations(@Req() req: any, @Query() query: GetChatsDto) {
    const userId = req.user?.userId;

    return this.chatsService.getUserConversations(
      userId,
      query.cursor,
      query.limit || 20,
    );
  }

  // 🔹 Messages (paginated)
  @Get(':conversationId/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesDto,
  ) {
    const userId = req.user?.userId;

    return this.chatsService.getMessages(
      userId,
      conversationId,
      query.cursor,
      query.limit || 20,
    );
  }
 
 

  // 🔹 Create conversation (first message)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @Req() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    const senderId = req.user?.userId;

    return this.chatsService.createConversationWithMessage(
      senderId,
      dto.participantIds,
      dto.content,
      dto.name,
      dto.type
    );
  }
}