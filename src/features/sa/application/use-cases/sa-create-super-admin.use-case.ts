import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../../../config/encrypt/encrypt-config';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { DataForCreateUserDto } from '../../../users/dto/data-for-create-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SaCreateSuperAdmin {
  constructor(
    private readonly expirationDateCalculator: ExpirationDateCalculator,
    private readonly usersRepo: UsersRepo,
    private readonly encryptConfig: EncryptConfig,
  ) {}
  async create(): Promise<UsersEntity> {
    const login = 'admin';
    const email = 'admin@gmail.com';

    // Hash the user's password
    const passwordHash = await this.encryptConfig.getSaPasswordHash();

    // Return the expirationDate in ISO format for user registration.
    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      3,
      0,
    );

    const dataForCreateUserDto: DataForCreateUserDto = {
      login,
      email,
      passwordHash,
      expirationDate,
    };

    return await this.usersRepo.createSaUser(dataForCreateUserDto);
  }
}
