import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService, SessionData } from '../auth.service';

@Injectable()
export class WsSessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const request = client.handshake;

    // Extract sessionId from cookies
    const cookies = request.headers.cookie;
    const sessionId = this.extractSessionId(cookies);

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const sessionData = await this.authService.validateSession(sessionId);

    if (!sessionData) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach session data to client
    client.user = sessionData;

    return true;
  }

  private extractSessionId(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith('sessionId='));

    if (!sessionCookie) return null;

    return sessionCookie.split('=')[1];
  }
}
