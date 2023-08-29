import { DataCleanupService } from './data-cleanup.service';
import { Module } from '@nestjs/common';
import { SecurityDevicesRawSqlRepository } from '../features/security-devices/infrastructure/security-devices-raw-sql.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';
import { KeyResolver } from '../common/helpers/key-resolver';
import { InvalidJwtRepo } from '../features/auth/infrastructure/invalid-jwt-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidJwtEntity } from '../features/auth/entities/invalid-jwt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvalidJwtEntity]), CqrsModule],
  providers: [
    DataCleanupService,
    UsersRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    InvalidJwtRepo,
    KeyResolver,
  ],
})
export class DataCleanupModule {}
