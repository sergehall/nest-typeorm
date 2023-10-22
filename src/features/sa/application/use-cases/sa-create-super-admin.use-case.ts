import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../../../config/encrypt/encrypt-config';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { DataForCreateUserDto } from '../../../users/dto/data-for-create-user.dto';
import { Injectable } from '@nestjs/common';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { UsersEntity } from '../../../users/entities/users.entity';

@Injectable()
export class SaCreateSuperAdmin {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly encryptConfig: EncryptConfig,
    private readonly expirationDateCalculator: ExpirationDateCalculator,
  ) {}
  async createUserSa(): Promise<CurrentUserDto> {
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

    const sa: UsersEntity = await this.usersRepo.createSaUser(
      dataForCreateUserDto,
    );
    return {
      userId: sa.userId,
      login: sa.login,
      email: sa.email,
      orgId: sa.orgId,
      roles: sa.roles,
      isBanned: sa.isBanned,
    };
  }
}
