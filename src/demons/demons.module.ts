import { Module } from '@nestjs/common';
import { DemonsService } from './demons.service';
import { DemonsController } from './demons.controller';
import { demonsProviders } from './infrastructure/demons.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { MailsModule } from '../mails/mails.module';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { UsersService } from '../users/users.service';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { CaslModule } from '../ability/casl.module';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';

@Module({
  imports: [DatabaseModule, MailsModule, CaslModule],
  controllers: [DemonsController],
  providers: [
    DemonsService,
    MailsRepository,
    UsersService,
    Pagination,
    ConvertFiltersForDB,
    UsersRepository,
    BlacklistJwtRepository,
    ...demonsProviders,
  ],
})
export class DemonsModule {}
