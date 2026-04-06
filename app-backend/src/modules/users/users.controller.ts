import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('api/v1/users')
@UseGuards(SessionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(@Query('query') query: string) {
    console.log('Search endpoint called with query:', query);
    
    if (!query || query.length < 3) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Search query must be at least 3 characters',
        data: [],
      };
    }

    const users = await this.usersService.searchUsers(query);
    console.log('Users found:', users);

    return {
      statusCode: HttpStatus.OK,
      message: 'Users found',
      data: users,
    };
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return {
      statusCode: HttpStatus.OK,
      message: 'All users',
      data: users,
    };
  }
}
