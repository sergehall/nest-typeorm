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
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.use-case';
import { ChangePasswordByRecoveryCodeUseCase } from './application/use-cases/change-password-by-recovery-code.use-case';
import { ExpirationDateCalculator } from '../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { DecodeTokenService } from '../../config/jwt/decode.service/decode-token-service';
import { ConfirmUserByCodeUseCase } from './application/use-cases/confirm-user-by-code.use-case';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { MailsService } from '../../mails/application/mails.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { InvalidJwtRepo } from './infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from './entities/invalid-jwt.entity';
import { AddInvalidJwtToBlacklistUseCase } from './application/use-cases/add-refresh-token-to-blacklist.use-case';
import { RefreshJwtUseCase } from './application/use-cases/refresh-jwt.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';

const authUseCases = [
  LoginUseCase,
  CreateUserUseCase,
  RefreshJwtUseCase,
  LogoutUseCase,
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
  PasswordRecoveryUseCase,
  AddInvalidJwtToBlacklistUseCase,
  ChangePasswordByRecoveryCodeUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InvalidJwtEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
    ]),
    UsersModule,
    PassportModule,
    JwtModule,
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JwtConfig,
    ParseQueriesService,
    AuthService,
    EncryptConfig,
    MailsService,
    UsersRepo,
    DecodeTokenService,
    UsersRawSqlRepository,
    SecurityDevicesService,
    ExpirationDateCalculator,
    InvalidJwtRepo,
    BlacklistJwtRawSqlRepository,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
    ...authUseCases,
  ],
  exports: [AuthService],
})
export class AuthModule {}
