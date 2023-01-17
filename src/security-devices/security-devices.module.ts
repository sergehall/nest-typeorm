import { Module } from '@nestjs/common';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesController } from './security-devices.controller';
import { SecurityDevicesRepository } from './infrastructure/security-devices.repository';
import { devicesProviders } from './infrastructure/devices.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule],
  controllers: [SecurityDevicesController],
  providers: [
    ConvertFiltersForDB,
    JwtService,
    Pagination,
    CaslAbilityFactory,
    UsersRepository,
    MailsRepository,
    UsersService,
    BlacklistJwtRepository,
    AuthService,
    SecurityDevicesRepository,
    SecurityDevicesService,
    ...devicesProviders,
  ],
})
export class SecurityDevicesModule {}
