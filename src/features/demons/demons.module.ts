import { Module } from '@nestjs/common';
import { DemonsService } from './application/demons.service';
import { DemonsController } from './api/demons.controller';
import { demonsProviders } from './infrastructure/demons.providers';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MailsModule } from '../mails/mails.module';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { UsersService } from '../users/application/users.service';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../common/pagination/pagination';
import { CaslModule } from '../../ability/casl.module';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { AddSentEmailTimeUseCase } from '../mails/application/use-cases/add-sent-email-time.use-case';
import { RemoveEmailByIdUseCase } from '../mails/application/use-cases/remove-email-byId.use-case';
import { MailsAdapter } from '../mails/adapters/mails.adapter';
import { UsersSqlRepository } from '../auth/infrastructure/rawSql-repository/usersSql.repository';

const demonsUseCases = [AddSentEmailTimeUseCase, RemoveEmailByIdUseCase];

@Module({
  imports: [DatabaseModule, MailsModule, CaslModule, CqrsModule],
  controllers: [DemonsController],
  providers: [
    MailsAdapter,
    DemonsService,
    MailsRepository,
    UsersService,
    Pagination,
    ConvertFiltersForDB,
    UsersRepository,
    UsersSqlRepository,
    BlacklistJwtRepository,
    ...demonsUseCases,
    ...demonsProviders,
  ],
})
export class DemonsModule {}
