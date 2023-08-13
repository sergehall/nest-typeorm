import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlacklistJwtRawSqlRepository } from '../features/auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../features/security-devices/infrastructure/security-devices-raw-sql.repository';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';

@Injectable()
export class DataCleanupService {
  constructor(
    private readonly securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
    private readonly blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
  ) {}

  async removeInvalidJWTFromBlackList(): Promise<void> {
    try {
      return await this.blacklistJwtRawSqlRepository.clearingInvalidJWTFromBlackList();
    } catch (error) {
      console.error('Error while clearing invalid JWT tokens:', error.message);
      throw new InternalServerErrorException(
        'Error while clearing invalid JWT tokens',
      );
    }
  }

  async removeDataUsersWithExpiredDate(): Promise<void> {
    try {
      return await this.usersRawSqlRepository.removeUsersData();
    } catch (error) {
      console.error('Error while removing expired user data:', error.message);
      throw new InternalServerErrorException(
        'Error while removing expired user data',
      );
    }
  }

  async removeDevicesWithExpiredDate(): Promise<void> {
    try {
      return await this.securityDevicesRawSqlRepository.clearingDevicesWithExpiredDate();
    } catch (error) {
      console.error(
        'Error while clearing devices with expired date:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Error while clearing devices with expired date',
      );
    }
  }
}
