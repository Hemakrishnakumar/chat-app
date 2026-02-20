import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import type { OtpProvider } from './otp/otp.provider';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('OTP_PROVIDER') private readonly otpProvider: OtpProvider,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(phone: string): Promise<void> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    await this.redis.set(`otp:${phone}`, code, 'EX', 600);

    await this.otpProvider.sendOtp(phone, code);
  }

  async verifyOtp(phone: string, code: string) {
    //get the stored OTP from Redis and compare
    const stored = await this.redis.get(`otp:${phone}`);

    if (!stored || stored !== code) {
      throw new Error('Invalid OTP');
    }

    await this.redis.del(`otp:${phone}`);

    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      user = await this.usersService.create(phone);
    }

    const payload = { sub: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, user };
  }
}
