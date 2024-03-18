import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestUsersEntity } from '../../../common/products/entities/unregistered-users.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

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
