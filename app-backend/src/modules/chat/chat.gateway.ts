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
import { MESSAGE_RECEIVED, NEW_CONVERSATION } from './types/socket.events';
import { ChatType } from './entities/conversation.entity';

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
  ) { }

  onModuleInit() {
    this.redisService.subscribe(NEW_CONVERSATION, (payload) => {
      this.handleNewCoversationMessage(payload);
    });
    this.redisService.subscribe(MESSAGE_RECEIVED, (payload) => {
      this.handleNewMessage(payload);
    });
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
    const { conversationId, message, senderId } = payload;
    const room = `conversation:${conversationId}`;
    
    // Broadcast message to all users in the conversation
    this.server.to(room).emit(MESSAGE_RECEIVED, {
      message: {
        ...message,
        status: 'delivered',
      },
    });

    // Get all members of this conversation
    const members = await this.chatService.getConversationMembers(conversationId);

    // For each member (except sender), calculate and emit their unread count
    for (const member of members) {
      if (member.userId !== senderId) {
        // Check if user is currently in the conversation room
        const sockets = this.userSockets.get(member.userId);
        let isUserInRoom = false;

        if (sockets) {
          // Check if any of the user's sockets are in the conversation room
          const roomSockets = this.server.sockets.adapter.rooms.get(room);
          if (roomSockets) {
            for (const socketId of sockets) {
              if (roomSockets.has(socketId)) {
                isUserInRoom = true;
                break;
              }
            }
          }
        }

        // Only send unread count if user is NOT in the room
        if (!isUserInRoom) {
          const unreadCount = await this.chatService.getUnreadCount(member.userId, conversationId);
          
          // Emit unread count update to that user
          if (sockets) {
            sockets.forEach((socketId) => {
              this.server.to(socketId).emit('unread_count_updated', {
                conversationId,
                unreadCount,
              });
            });
          }
        }
      }
    }
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
      callback?: (response: any) => void,
    ) {
      const userId = client.user?.userId;
      console.log('=== SEND_MESSAGE HANDLER ===');
      console.log('userId:', userId);
      console.log('client.user:', client.user);
      console.log('data:', data);
      console.log('callback exists:', !!callback);

      if (!userId) {
        console.log('ERROR: No userId found');
        return;
      }

      try {
        // Save message to database
        const message = await this.chatService.saveMessage(
          data.conversationId,
          userId,
          data.content,
        );
        console.log('Message saved to DB:', message);

        const room = `conversation:${data.conversationId}`;
        console.log('Broadcasting to room:', room);

        // Broadcast message to all users in the conversation
        this.server.to(room).emit('message_received', {
          message: {
            ...message,
            status: 'delivered',
          },
        });
        console.log('Emitted message_received to room');

        // Send acknowledgment to sender
        if (callback) {
          console.log('Calling callback with success');
          callback({ success: true, message });
        } else {
          console.log('WARNING: No callback provided');
        }

        // Get all members of this conversation
        const members = await this.chatService.getConversationMembers(data.conversationId);
        console.log('Conversation members:', members.length);

        // For each member (except sender), calculate and emit their unread count
        for (const member of members) {
          if (member.userId !== userId) {
            // Check if user is currently in the conversation room
            const sockets = this.userSockets.get(member.userId);
            let isUserInRoom = false;

            if (sockets) {
              // Check if any of the user's sockets are in the conversation room
              const roomSockets = this.server.sockets.adapter.rooms.get(room);
              if (roomSockets) {
                for (const socketId of sockets) {
                  if (roomSockets.has(socketId)) {
                    isUserInRoom = true;
                    break;
                  }
                }
              }
            }

            // Only send unread count if user is NOT in the room
            if (!isUserInRoom) {
              const unreadCount = await this.chatService.getUnreadCount(member.userId, data.conversationId);
              console.log(`Sending unread count ${unreadCount} to user ${member.userId}`);

              // Emit unread count update to that user
              if (sockets) {
                sockets.forEach((socketId) => {
                  this.server.to(socketId).emit('unread_count_updated', {
                    conversationId: data.conversationId,
                    unreadCount,
                  });
                });
              }
            }
          }
        }

        // Publish to Redis for other server instances (if running multiple servers)
        this.redisService.publish('MESSAGE_RECEIVED', {      
          conversationId: data.conversationId,
          message: {...message, status: 'delivered'},
          senderId: userId
        });
        console.log('Published to Redis');
      } catch (error) {
        console.error('Error in handleSendMessage:', error);
        if (callback) {
          callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
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
