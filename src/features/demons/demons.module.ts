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
import { MailsAdapter } from '../mails/adapters/mails.adapter';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { RemoveEmailConfirmCodeByIdUseCase } from '../mails/application/use-cases/remove-emai-confCode-byId.use-case';
import { RemoveEmailRecoverCodeByIdUseCase } from '../mails/application/use-cases/remove-emai-recCode-byId.use-case';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';

const demonsUseCases = [
  AddSentEmailTimeUseCase,
  RemoveEmailConfirmCodeByIdUseCase,
  RemoveEmailRecoverCodeByIdUseCase,
];

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
    SentEmailsTimeConfirmAndRecoverCodesRepository,
    SecurityDevicesRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    ...demonsUseCases,
    ...demonsProviders,
  ],
})
export class DemonsModule {}
