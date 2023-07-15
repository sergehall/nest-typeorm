import { Module } from '@nestjs/common';
import { DemonsService } from './application/demons.service';
import { DemonsController } from './api/demons.controller';
import { demonsProviders } from './infrastructure/demons.providers';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MailsModule } from '../mails/mails.module';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
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
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { SentEmailEmailsConfirmationCodeTimeRepository } from '../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/raw-sql-repository/blacklist-jwt-raw-sql.repository';

const demonsUseCases = [AddSentEmailTimeUseCase, RemoveEmailByIdUseCase];

@Module({
  imports: [DatabaseModule, MailsModule, CaslModule, CqrsModule],
  controllers: [DemonsController],
  providers: [
    MailsAdapter,
    DemonsService,
    MailsRawSqlRepository,
    UsersService,
    Pagination,
    ConvertFiltersForDB,
    UsersRepository,
    UsersRawSqlRepository,
    BlacklistJwtRepository,
    SentEmailEmailsConfirmationCodeTimeRepository,
    BlacklistJwtRawSqlRepository,
    ...demonsUseCases,
    ...demonsProviders,
  ],
})
export class DemonsModule {}
