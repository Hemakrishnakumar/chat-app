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
    private redisService: RedisService
  ) {}

  onModuleInit() {
      this.redisService.subscribe('NEW_MESSAGE', (payload) => {
      this.handleNewCoversationMessage(payload);
    });
  }

  private handleNewCoversationMessage(payload: any) {
    const { conversation, message,  users} = payload;
    const msg = {
      id: conversation.id,
      type: conversation.type,
      updatedAt: conversation.updatedAt,
      lastMessage: message,
      unreadCount: 1
    }
    users.forEach((user: User) => {
    const sockets = this.userSockets.get(user.id);

    if (!sockets) return;
    const userName = conversation.type === 'direct' ? users.find((member: User) => member.id !== user.id)?.name: "";       

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('NEW_CONVERSATION', {
        ...msg,
        name: userName
      });
    });
  });     
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

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    client: AuthenticatedSocket,
    data: { conversationId: string },
  ) {
    const userId = client.user?.userId;
    if (!userId) return;

    const room = `conversation:${data.conversationId}`;
    client.join(room);

    // Notify others that user joined
    this.server.to(room).emit('user_joined', {
      userId,
      userName: client.user?.name,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    client: AuthenticatedSocket,
    data: { conversationId: string },
  ) {
    const userId = client.user?.userId;
    if (!userId) return;

    const room = `conversation:${data.conversationId}`;
    client.leave(room);

    // Notify others that user left
    this.server.to(room).emit('user_left', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: AuthenticatedSocket,
    data: { conversationId: string; content: string },
  ) {
    const userId = client.user?.userId;
    if (!userId) return;

    // Save message to database
    const message = await this.chatService.saveMessage(
      data.conversationId,
      userId,
      data.content,
    );

    const room = `conversation:${data.conversationId}`;

    // Broadcast message to all users in the conversation with full message object
    this.server.to(room).emit('message_received', {
      message: {
        id: message.id,
        conversationId: data.conversationId,
        senderId: userId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        status: 'delivered',
      },
    });
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

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    client: AuthenticatedSocket,
    data: { conversationId: string },
  ) {
    const userId = client.user?.userId;
    if (!userId) return;

    // Update user's joinedAt to mark as read
    await this.chatService.updateMemberJoinedAt(userId, data.conversationId);
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

  // Helper method to send message to conversation
  sendToConversation(conversationId: string, event: string, data: any) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(event, data);
  }
}
