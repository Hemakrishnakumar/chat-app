import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';

export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    return server;
  }
}
