import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../common/pagination/pagination';
import { AuthService } from '../auth/application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from '../../ability/casl.module';
import { UsersRepository } from './infrastructure/users.repository';
import { usersProviders } from './infrastructure/users.providers';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserByMongooseModelUseCase } from './application/use-cases/create-user-byMongooseModel.use-case';
import { CreateUserByInstanceUseCase } from './application/use-cases/create-user-byInstance.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { RemoveUserByIdUseCase } from './application/use-cases/remove-user-byId.use-case';
import { CheckingUserExistenceUseCase } from './application/use-cases/checking-user-existence.use-case';
import { UsersRawSqlRepository } from './infrastructure/users-raw-sql.repository';
import { RecoveryCodeExistsRule } from '../../pipes/recoveryCode-exists-rule.validation';
import { MongoDBModule } from '../../config/db/mongo/mongo-db.module';
import { ExpirationDateCalculator } from '../common/calculator/expiration-date-calculator';

const usersUseCases = [
  CreateUserByMongooseModelUseCase,
  CreateUserByInstanceUseCase,
  UpdateUserUseCase,
  RemoveUserByIdUseCase,
  CheckingUserExistenceUseCase,
];
const usersRules = [RecoveryCodeExistsRule];

@Module({
  imports: [MongoDBModule, CaslModule, CqrsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    Pagination,
    JwtConfig,
    BlacklistJwtRepository,
    UsersRawSqlRepository,
    AuthService,
    UsersRepository,
    JwtService,
    ConvertFiltersForDB,
    MailsRawSqlRepository,
    ExpirationDateCalculator,
    ...usersRules,
    ...usersUseCases,
    ...usersProviders,
  ],
  exports: [UsersService],
})
export class UsersModule {}
