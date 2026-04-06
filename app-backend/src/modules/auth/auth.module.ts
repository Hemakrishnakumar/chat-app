import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionGuard } from './guards/session.guard';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '15m' },
      }),
    }),
    forwardRef(() => UsersModule),
    RedisModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, SessionGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, SessionGuard],
})
export class AuthModule {}
