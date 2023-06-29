import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntityPg } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthPgService {
  constructor(
    @InjectRepository(UserEntityPg)
    private usersRepository: Repository<UserEntityPg>,
  ) {}

  async findAll(): Promise<UserEntityPg[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntityPg | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
