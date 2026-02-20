import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConsoleOtpProvider } from './otp/console-otp.provider';
import { SmsOtpProvider } from './otp/sms-otp.provider';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: 'supersecret',
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'OTP_PROVIDER',
      useClass:
        process.env.NODE_ENV === 'production'
          ? SmsOtpProvider
          : ConsoleOtpProvider,
    },
    JwtStrategy,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
