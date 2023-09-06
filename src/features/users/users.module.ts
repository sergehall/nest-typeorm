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
import { EmailAndLoginNotExistValidator } from '../../common/validators/email-and-login-not-exist.validator';
import { CodeExistsValidator } from '../../common/validators/code-exists.validator';
import { UsersRepo } from './infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { SaCreateSuperAdmin } from '../sa/application/use-cases/sa-create-super-admin.use-case';

const usersUseCases = [
  CreateUserUseCase,
  UpdateUserUseCase,
  RemoveUserByIdUseCase,
  FindUsersUseCase,
  FindUserByIdUseCase,
];

const usersValidators = [
  LoginEmailExistsValidator,
  EmailAndLoginNotExistValidator,
  CodeExistsValidator,
];

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), CaslModule, CqrsModule],
  controllers: [UsersController],
  providers: [
    ParseQueriesService,
    SaCreateSuperAdmin,
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
