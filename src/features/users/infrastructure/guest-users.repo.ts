import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GuestUsersEntity } from '../../products/entities/unregistered-users.entity';

@Injectable()
export class GuestUsersRepo {
  constructor(
    @InjectRepository(GuestUsersEntity)
    protected guestUsersRepository: Repository<GuestUsersEntity>,
  ) {}

  async getInstanceOfGuestUser(): Promise<GuestUsersEntity> {
    return GuestUsersEntity.createGuestUsersEntity();
  }

  async save(guestUsersEntity: GuestUsersEntity): Promise<GuestUsersEntity> {
    try {
      return await this.guestUsersRepository.save(guestUsersEntity);
    } catch (error) {
      console.log('Error saving guestUsersEntity:', error);
      throw new InternalServerErrorException(
        'Error saving guestUsersEntity' + error.message,
      );
    }
  }
}
