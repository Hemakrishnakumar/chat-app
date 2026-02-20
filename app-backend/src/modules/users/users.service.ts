import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByPhone(phoneNumber: string) {
    return this.usersRepo.findOne({ where: { phoneNumber } });
  }

  create(phoneNumber: string) {
    const user = this.usersRepo.create({ phoneNumber });
    return this.usersRepo.save(user);
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }
}
