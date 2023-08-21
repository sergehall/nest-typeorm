import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './api/users.controller';
import { AuthService } from '../auth/application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from '../../ability/casl.module';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { RemoveUserByIdUseCase } from './application/use-cases/remove-user-byId.use-case';
import { UsersRawSqlRepository } from './infrastructure/users-raw-sql.repository';
import { ExpirationDateCalculator } from '../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { LoginEmailExistsValidator } from '../../common/validators/login-email-exists.validator';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { EmailNotExistValidator } from '../../common/validators/email-not-exist.validator';
import { CodeExistsValidator } from '../../common/validators/code-exists.validator';
import { UsersRepo } from './infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';

const usersUseCases = [
  CreateUserUseCase,
  UpdateUserUseCase,
  RemoveUserByIdUseCase,
];

const usersValidators = [
  LoginEmailExistsValidator,
  EmailNotExistValidator,
  CodeExistsValidator,
];

@Module({
  imports: [TypeOrmModule.forFeature([Users]), CaslModule, CqrsModule],
  controllers: [UsersController],
  providers: [
    ParseQueriesService,
    UsersService,
    JwtConfig,
    UsersRawSqlRepository,
    UsersRepo,
    AuthService,
    JwtService,
    EncryptConfig,
    KeyResolver,
    ExpirationDateCalculator,
    ...usersValidators,
    ...usersUseCases,
  ],
  exports: [UsersService],
})
export class UsersModule {}
