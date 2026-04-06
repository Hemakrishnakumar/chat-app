import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsSessionGuard } from '../auth/guards/ws-session.guard';
import { SessionData } from '../auth/auth.service';

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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.user?.userId;

    if (!userId) {
      client.disconnect();
      return;
    }

    // Track user's socket connections
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    console.log(`User ${userId} connected with socket ${client.id}`);
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
