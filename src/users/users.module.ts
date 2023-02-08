import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './application/users.controller';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { AuthService } from '../auth/application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from '../ability/casl.module';
import { UsersRepository } from './infrastructure/users.repository';
import { usersProviders } from './infrastructure/users.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { JwtConfig } from '../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserByMongooseModelUseCase } from './application/use-cases/create-user-byMongooseModel.use-case';
import { CreateUserByInstanceUseCase } from './application/use-cases/create-user-byInstance.use-case';

const useCases = [
  CreateUserByMongooseModelUseCase,
  CreateUserByInstanceUseCase,
];

@Module({
  imports: [DatabaseModule, CaslModule, CqrsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    Pagination,
    JwtConfig,
    BlacklistJwtRepository,
    AuthService,
    UsersRepository,
    JwtService,
    ConvertFiltersForDB,
    MailsRepository,
    ...useCases,
    ...usersProviders,
  ],
  exports: [UsersService],
})
export class UsersModule {}
