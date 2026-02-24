import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);

      const userId = payload.sub;

      // store online status in Redis
      await this.redis.set(`online:${userId}`, '1');

      // attach user to socket
      socket.data.userId = userId;
      await socket.join(`user:${userId}`);

      console.log(`🟢 User online: ${userId}`);
    } catch (err) {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;

    if (!userId) return;

    await this.redis.del(`online:${userId}`);

    console.log(`🔴 User offline: ${userId}`);
  }
}
