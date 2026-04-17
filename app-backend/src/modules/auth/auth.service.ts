import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login-user.dto';

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
  photo_url: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async register(createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto): Promise<{ sessionId: string; user: any }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)) ) {
      throw new UnauthorizedException('Invalid email or password');
    }    
    
    // Create session
    const sessionId = uuidv4();
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      photo_url: user.photo_url,
      createdAt: Date.now(),
    };

    // Store session in Redis with 1 day expiration (86400 seconds)
    await this.redis.setex(
      `session:${sessionId}`,
      86400,
      JSON.stringify(sessionData),
    );

    return {
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo_url: user.photo_url,
      },
    };
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await this.redis.get(`session:${sessionId}`);
    if (!sessionData) {
      return null;
    }
    return JSON.parse(sessionData);
  }

  async getUserById(userId: string) {
    return await this.usersService.findById(userId);
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }  
}
