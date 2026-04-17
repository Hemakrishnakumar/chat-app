import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsSessionGuard } from '../auth/guards/ws-session.guard';
import { AuthService, SessionData } from '../auth/auth.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { User } from '../users/entities/user.entity';
import {  MARK_READ, MESSAGE_RECEIVED, NEW_CONVERSATION, SEND_MESSAGE, UPDATE_UNREAD_COUNT } from './types/socket.events';
import { ChatType } from './entities/conversation.entity';
import * as webpush from 'web-push';

interface AuthenticatedSocket extends Socket {
  user?: SessionData;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})

@UseGuards(WsSessionGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService,
    private redisService: RedisService,
    ) { }

  onModuleInit() {
    this.redisService.subscribe(NEW_CONVERSATION, (payload) => this.handleNewCoversationMessage(payload));
    this.redisService.subscribe(MESSAGE_RECEIVED, (payload) => this.handleNewMessage(payload));
    this.redisService.subscribe(UPDATE_UNREAD_COUNT, (payload) => this.handleUpdateUnreadCount(payload));
  }

  //REDIS SUBSCRIPTION HANDLERS
  private handleNewCoversationMessage(payload: any) {
    const { conversation, message, users } = payload;
    const msg = {
      id: conversation.id,
      type: conversation.type,
      updatedAt: conversation.updatedAt,
      lastMessage: message,
      unreadCount: 1  //harcoded for sometime
    }
    users.forEach((user: User) => {
      const sockets = this.userSockets.get(user.id);

      if (!sockets) return;
      const userName = conversation.type === ChatType.DIRECT ? users.find((member: User) => member.id !== user.id)?.name : conversation.name;

      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(NEW_CONVERSATION, {
          ...msg,
          name: userName
        });
      });
    });
  }

  async handleNewMessage(payload: any) {
    const { conversationId, message } = payload;
   
    const members = await this.chatService.getConversationMembers(conversationId);

    for (const member of members) {
      const sockets = this.userSockets.get(member.userId);
      if (!sockets) continue;
      
      const unreadCount = await this.chatService.getUnreadCount(member.userId, conversationId);

      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(MESSAGE_RECEIVED, {
          conversationId,
          message,
          unreadCount,
        });
      });
      const user = await this.chatService.getPushSubscription(member.userId);
      await webpush.sendNotification(
        user?.subscription,
          JSON.stringify({
            title: 'New Message',
            body: 'Krishna sent you a message',
          }),
);
    }
  }

  async handleUpdateUnreadCount(payload: any) {
    const { userId, conversationId} = payload;
    this.sendToUser(userId, UPDATE_UNREAD_COUNT, { userId, conversationId })    
  }


  private extractSessionId(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith('sessionId='));

    if (!sessionCookie) return null;

    return sessionCookie.split('=')[1];
  }


  async handleConnection(client: AuthenticatedSocket) {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      const sessionId = this.extractSessionId(cookieHeader);

      if (!sessionId) {
        console.log('No sessionId found');
        client.disconnect();
        return;
      }

      const sessionData = await this.authService.validateSession(sessionId);

      if (!sessionData) {
        console.log('Invalid session');
        client.disconnect();
        return;
      }

      const userId = sessionData.userId;

      // Attach user data to socket
      client.user = sessionData;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      this.userSockets.get(userId)!.add(client.id);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (err) {
      console.error('Connection error:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.userId;

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      console.log(`User ${userId} disconnected`);
    }
  }


  @SubscribeMessage(SEND_MESSAGE)
  async handleSendMessage(
    client: AuthenticatedSocket,
    data: { conversationId: string; content: string },
  ) {
    const userId = client.user?.userId;

    if (!userId) {
      return { success: false, error: 'No Authentication' }
    }

    try {
      const message = await this.chatService.saveMessage(
        data.conversationId,
        userId,
        data.content,
      );

      // Publish to Redis for other server instances (if running multiple servers)
      this.redisService.publish(MESSAGE_RECEIVED, {
        conversationId: data.conversationId,
        message: { ...message, status: 'sent' },
      });
      return { success: true, message }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      return { success: false, error: 'Failed to send message' }
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    client: AuthenticatedSocket,
    data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.user?.userId;
    if (!userId) return;

    const room = `conversation:${data.conversationId}`;

    this.server.to(room).emit('user_typing', {
      userId,
      userName: client.user?.name,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage(MARK_READ)
  async handleMarkRead(
    client: AuthenticatedSocket,
    data: { conversationId: string },
  ) {
    const userId = client.user?.userId;
    if (!userId) return;
    //Updated conversationMember lastMessagreRead to latest in the conversation
    await this.chatService.markConversationAsRead(userId, data.conversationId);
    this.redisService.publish(UPDATE_UNREAD_COUNT, { userId, conversationId: data.conversationId})
    return { success: true }
  }

  // Helper method to send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  } 
}
