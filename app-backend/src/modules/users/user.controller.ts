import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('lookup')
  async lookupUser(@Query('phone') phone: string, @Req() req: any) {
    console.log({phone});
    if (!phone) {
      throw new BadRequestException('Phone is required');
    }

    const user = await this.usersService.findByPhone(phone);

    if (!user) {
      return null;
    }

    // Prevent self-chat
    if (user.id === req.user.userId) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phoneNumber,
    };
  }
}
