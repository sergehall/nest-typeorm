import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from '../../ability/casl.module';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { RemoveUserByIdUseCase } from './application/use-cases/remove-user-byId.use-case';
import { VerifyUserExistenceUseCase } from './application/use-cases/verify-user-existence.use-case';
import { UsersRawSqlRepository } from './infrastructure/users-raw-sql.repository';
import { RecoveryCodeExistsRule } from '../../pipes/recovery-code-exists-rule.validation';
import { ExpirationDateCalculator } from '../../common/calculator/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';

const usersUseCases = [
  CreateUserUseCase,
  UpdateUserUseCase,
  RemoveUserByIdUseCase,
  VerifyUserExistenceUseCase,
];
const usersRules = [RecoveryCodeExistsRule];

@Module({
  imports: [CaslModule, CqrsModule],
  controllers: [UsersController],
  providers: [
    ParseQueriesService,
    UsersService,
    JwtConfig,
    UsersRawSqlRepository,
    AuthService,
    JwtService,
    EncryptConfig,
    KeyArrayProcessor,
    MailsRawSqlRepository,
    ExpirationDateCalculator,
    ...usersRules,
    ...usersUseCases,
  ],
  exports: [UsersService],
})
export class UsersModule {}
