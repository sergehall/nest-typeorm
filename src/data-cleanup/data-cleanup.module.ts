import { DataCleanupService } from './data-cleanup.service';
import { Module } from '@nestjs/common';
import { SecurityDevicesRawSqlRepository } from '../features/security-devices/infrastructure/security-devices-raw-sql.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { BlacklistJwtRawSqlRepository } from '../features/auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';
import { KeyResolver } from '../common/query/key-resolver';

@Module({
  imports: [CqrsModule],
  providers: [
    DataCleanupService,
    UsersRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    KeyResolver,
  ],
})
export class DataCleanupModule {}
