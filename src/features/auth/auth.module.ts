import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './api/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { SecurityDevicesService } from '../security-devices/application/security-devices.service';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUserUseCase } from './application/use-cases/registration-user.use-case';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.use-case';
import { UpdateSentConfirmationCodeUseCase } from '../users/application/use-cases/update-sent-confirmation-code.use-case';
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
import { PasswordRecoveryViaEmailConfirmationUseCase } from './application/use-cases/password-recovery-via-email-confirmation.use-case';
import { ChangePasswordByRecoveryCodeUseCase } from './application/use-cases/change-password-by-recovery-code.use-case';
import { ExpirationDateCalculator } from '../../common/calculator/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { DecodeTokenService } from '../../config/jwt/decode.service/decode-token-service';
import { AddRefreshTokenToBlacklistUseCase } from './application/use-cases/add-refresh-token-to-blacklist.use-case';
import { ConfirmUserByCodeUseCase } from './application/use-cases/confirm-user-by-code.use-case';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';
import { MailsService } from '../mails/application/mails.service';

const authUseCases = [
  CreateUserUseCase,
  AddRefreshTokenToBlacklistUseCase,
  RegistrationUserUseCase,
  ConfirmUserByCodeUseCase,
  UpdateSentConfirmationCodeUseCase,
  ValidatePasswordUseCase,
  SignAccessJwtUseCase,
  UpdateAccessJwtUseCase,
  SignRefreshJwtUseCase,
  UpdateRefreshJwtUseCase,
  ValidAccessJwtUseCase,
  ValidRefreshJwtUseCase,
  PasswordRecoveryViaEmailConfirmationUseCase,
  ChangePasswordByRecoveryCodeUseCase,
];

@Module({
  imports: [UsersModule, PassportModule, JwtModule, CqrsModule],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JwtConfig,
    ParseQueriesService,
    MailsRawSqlRepository,
    AuthService,
    EncryptConfig,
    MailsService,
    KeyArrayProcessor,
    DecodeTokenService,
    UsersRawSqlRepository,
    SecurityDevicesService,
    ExpirationDateCalculator,
    BlacklistJwtRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    ...authUseCases,
  ],
  exports: [AuthService],
})
export class AuthModule {}
