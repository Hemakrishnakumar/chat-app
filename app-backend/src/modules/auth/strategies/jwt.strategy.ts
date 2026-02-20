import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'supersecret',
    });
  }

  async validate(payload: { sub: string }) {
    await new Promise((resolve) => setTimeout(resolve, 0)); // Simulate async operation
    return { userId: payload.sub };
  }
}
