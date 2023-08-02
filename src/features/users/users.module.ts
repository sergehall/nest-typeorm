import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from '../../ability/casl.module';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserByInstanceUseCase } from './application/use-cases/create-user-byInstance.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { RemoveUserByIdUseCase } from './application/use-cases/remove-user-byId.use-case';
import { CheckingUserExistenceUseCase } from './application/use-cases/checking-user-existence.use-case';
import { UsersRawSqlRepository } from './infrastructure/users-raw-sql.repository';
import { RecoveryCodeExistsRule } from '../../pipes/recoveryCode-exists-rule.validation';
import { ExpirationDateCalculator } from '../common/calculator/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';

const usersUseCases = [
  CreateUserByInstanceUseCase,
  UpdateUserUseCase,
  RemoveUserByIdUseCase,
  CheckingUserExistenceUseCase,
];
const usersRules = [RecoveryCodeExistsRule];

@Module({
  imports: [CaslModule, CqrsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtConfig,
    UsersRawSqlRepository,
    AuthService,
    JwtService,
    EncryptConfig,
    MailsRawSqlRepository,
    ExpirationDateCalculator,
    ...usersRules,
    ...usersUseCases,
  ],
  exports: [UsersService],
})
export class UsersModule {}
