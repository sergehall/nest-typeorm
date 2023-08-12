import { DataCleanupService } from './data-cleanup.service';
import { Module } from '@nestjs/common';
import { SecurityDevicesRawSqlRepository } from '../features/security-devices/infrastructure/security-devices-raw-sql.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { BlacklistJwtRawSqlRepository } from '../features/auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';
import { KeyArrayProcessor } from '../common/query/get-key-from-array-or-default';

@Module({
  imports: [CqrsModule],
  providers: [
    DataCleanupService,
    UsersRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    KeyArrayProcessor,
  ],
})
export class DataCleanupModule {}
