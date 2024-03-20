import { Module } from '@nestjs/common';
import { SecurityDevicesService } from './application/security-devices.service';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersService } from '../users/application/users.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt/jwt.config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateDeviceUseCase } from './application/use-cases/create-device.use-case';
import { RemoveDevicesByDeviceIdUseCase } from './application/use-cases/remove-devices-by-deviceId.use-case';
import { RemoveDevicesExceptCurrentUseCase } from './application/use-cases/remove-devices-except-current.use-case';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchDevicesUseCase } from './application/use-cases/search-devices.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { SecurityDevicesRepo } from './infrastructure/security-devices.repo';
import { UsersEntity } from '../users/entities/users.entity';
import { SecurityDevicesEntity } from './entities/session-devices.entity';
import { InvalidJwtRepo } from '../auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../auth/entities/invalid-jwt.entity';
import { UpdateDeviceUseCase } from './application/use-cases/update-device.use-case';
import { DeleteDevicesAfterLogoutUseCase } from './application/use-cases/delete-devices-after-logout.use-case';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { AuthService } from '../auth/application/auth.service';

const securityDevicesCases = [
  SearchDevicesUseCase,
  CreateDeviceUseCase,
  UpdateDeviceUseCase,
  DeleteDevicesAfterLogoutUseCase,
  RemoveDevicesByDeviceIdUseCase,
  RemoveDevicesExceptCurrentUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SecurityDevicesEntity,
      UsersEntity,
      InvalidJwtEntity,
      PairsGameEntity,
      ChallengeQuestionsEntity,
      QuestionsQuizEntity,
    ]),
    CqrsModule,
  ],
  controllers: [SecurityDevicesController],
  providers: [
    JwtService,
    JwtConfig,
    CaslAbilityFactory,
    AuthService,
    UsersService,
    SecurityDevicesService,
    UsersRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    GameQuestionsRepo,
    SecurityDevicesRepo,
    ChallengesQuestionsRepo,
    ...helpers,
    ...securityDevicesCases,
  ],
})
export class SecurityDevicesModule {}
