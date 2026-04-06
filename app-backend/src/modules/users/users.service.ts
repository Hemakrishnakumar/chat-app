import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    console.log(this.config.get<string>('SKIP_EMAIL_VERIFICATION'))
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = this.userRepository.create({
        email,
        name,
        password: hashedPassword,
        emailVerified: this.config.get<string>('SKIP_EMAIL_VERIFICATION') === 'true',
        photo_url: null,
      });

      // Save user to database
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }  

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    // This method is kept for compatibility with existing OTP flow
    // In a real app, you might have a phone field
    return null;
  }

  async searchUsers(query: string): Promise<Partial<User>[]> {
    console.log({ query })
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.name ILIKE :query OR user.email ILIKE :query', { query: `%${query}%` })
      .select(['user.id', 'user.name', 'user.email', 'user.photo_url'])
      .take(10)
      .getMany();

    console.log('Search results:', users);
    return users;
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email', 'photo_url'],
      take: 20
    });
    console.log('All users:', users);
    return users;
  }
}
