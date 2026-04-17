import { Body, Controller, Post, ValidationPipe, HttpCode, HttpStatus, Res, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login-user.dto';

@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
    };
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res() res: Response,
  ) {
    const { sessionId, user } = await this.authService.login(loginDto);

    // Set session cookie with 1 day expiration
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000, // 1 day in milliseconds
      path: '/',
    });

    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user,
      },
    });
  }

  @Get('auth/profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request) {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const sessionData = await this.authService.validateSession(sessionId);

    if (!sessionData) {
      throw new UnauthorizedException('Invalid or expired session');
    }  

    
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: sessionData.userId,
          email: sessionData.email,
          name: sessionData.name,         
          photo_url: sessionData.photo_url,
        }
      },
    };
  }

  @Post('auth/logout')
  async logout(@Res() res: Response) {
    res.cookie('sessionId', null);
    return res.json({ message: 'Logged out successfully'});
  }  
}
