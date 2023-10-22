import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InvalidJwtRepo } from '../../features/auth/infrastructure/invalid-jwt-repo';
import { SecurityDevicesRepo } from '../../features/security-devices/infrastructure/security-devices.repo';
import { UsersRepo } from '../../features/users/infrastructure/users-repo';

@Injectable()
export class DataCleanupService {
  constructor(
    private readonly invalidJwtRepo: InvalidJwtRepo,
    private readonly securityDevicesRepo: SecurityDevicesRepo,
    private readonly usersRepo: UsersRepo,
  ) {}

  async clearingExpiredJwt(): Promise<void> {
    try {
      return await this.invalidJwtRepo.clearingExpiredJwt();
    } catch (error) {
      console.error('Error while clearing invalid JWT tokens:', error.message);
      throw new InternalServerErrorException(
        'Error while clearing invalid JWT tokens',
      );
    }
  }

  async clearingExpiredUsersData(): Promise<void> {
    try {
      return await this.usersRepo.clearingExpiredUsersData();
    } catch (error) {
      console.error('Error while removing expired user data:', error.message);
      throw new InternalServerErrorException(
        'Error while removing expired user data',
      );
    }
  }

  async clearingExpiredDevices(): Promise<void> {
    try {
      return await this.securityDevicesRepo.clearingExpiredDevices();
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
