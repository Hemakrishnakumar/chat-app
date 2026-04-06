import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthService, SessionData } from '../auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const sessionData = await this.authService.validateSession(sessionId);

    if (!sessionData) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach session data to request
    request.user = sessionData;

    return true;
  }
}
