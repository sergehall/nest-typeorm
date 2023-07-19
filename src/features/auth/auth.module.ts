import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './api/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { authProviders } from './infrastructure/auth.providers';
import { SecurityDevicesService } from '../security-devices/application/security-devices.service';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { BlacklistJwtRepository } from './infrastructure/blacklist-jwt.repository';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUserUseCase } from './application/use-cases/registration-user.use-case';
import { CreateUserByInstanceUseCase } from '../users/application/use-cases/create-user-byInstance.use-case';
import { ConfirmUserByCodeUseCase } from './application/use-cases/confirm-user-byCode-inParam.use-case';
import { UpdateSentConfirmationCodeUseCase } from '../users/application/use-cases/update-sent-confirmation-code.use-case';
import { AddRefreshTokenToBlackListUseCase } from './application/use-cases/add-refresh-token-to-blackList.use-case';
import { ValidatePasswordUseCase } from './application/use-cases/validate-password.use-case';
import { SignAccessJwtUseCase } from './application/use-cases/sign-access-jwt.use-case';
import { UpdateAccessJwtUseCase } from './application/use-cases/update-access-jwt.use-case';
import { SignRefreshJwtUseCase } from './application/use-cases/sign-refresh-jwt.use-case';
import { UpdateRefreshJwtUseCase } from './application/use-cases/update-refresh-jwt.use-case';
import { ValidAccessJwtUseCase } from './application/use-cases/valid-access-jwt.use-case';
import { ValidRefreshJwtUseCase } from './application/use-cases/valid-refresh-jwt.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from './infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { PasswordRecoveryUseCase } from './application/use-cases/passwordRecovery.use-case';
import { newPasswordRecoveryUseCase } from './application/use-cases/newPasswordRecovery.use-case';

const authUseCases = [
  CreateUserByInstanceUseCase,
  RegistrationUserUseCase,
  ConfirmUserByCodeUseCase,
  UpdateSentConfirmationCodeUseCase,
  AddRefreshTokenToBlackListUseCase,
  ValidatePasswordUseCase,
  SignAccessJwtUseCase,
  UpdateAccessJwtUseCase,
  SignRefreshJwtUseCase,
  UpdateRefreshJwtUseCase,
  ValidAccessJwtUseCase,
  ValidRefreshJwtUseCase,
  PasswordRecoveryUseCase,
  newPasswordRecoveryUseCase,
];

@Module({
  imports: [DatabaseModule, UsersModule, PassportModule, JwtModule, CqrsModule],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    MailsRawSqlRepository,
    JwtConfig,
    AuthService,
    UsersRepository,
    BlacklistJwtRepository,
    SecurityDevicesRepository,
    UsersRawSqlRepository,
    SecurityDevicesService,
    BlacklistJwtRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    ...authUseCases,
    ...authProviders,
  ],
  exports: [AuthService],
})
export class AuthModule {}
