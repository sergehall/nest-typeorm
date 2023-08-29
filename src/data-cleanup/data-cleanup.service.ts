import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SecurityDevicesRawSqlRepository } from '../features/security-devices/infrastructure/security-devices-raw-sql.repository';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';
import { InvalidJwtRepo } from '../features/auth/infrastructure/invalid-jwt-repo';

@Injectable()
export class DataCleanupService {
  constructor(
    private readonly invalidJwtRepo: InvalidJwtRepo,
    private readonly securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
  ) {}

  async clearingExpiredJwtFromInvalidJwt(): Promise<void> {
    try {
      return await this.invalidJwtRepo.clearingExpiredJwt();
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
