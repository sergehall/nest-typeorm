import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { MailsModule } from '../mails/mails.module';
import { UsersService } from '../features/users/application/users.service';
import { CaslModule } from '../ability/casl.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';
import { MailerConfig } from '../config/mailer/mailer-config';
import { PostgresConfig } from '../config/db/postgres/postgres.config';
import { DataCleanupService } from '../data-cleanup/data-cleanup.service';
import { SentCodeLogRepository } from '../mails/infrastructure/sent-code-log.repository';
import { MailOptionsBuilder } from '../mails/mail-options/mail-options-builder';
import { KeyResolver } from '../common/helpers/key-resolver';
import { UsersRepo } from '../features/users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../features/users/entities/users.entity';
import { InvalidJwtRepo } from '../features/auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../features/auth/entities/invalid-jwt.entity';
import { SecurityDevicesEntity } from '../features/security-devices/entities/session-devices.entity';
import { SecurityDevicesRepo } from '../features/security-devices/infrastructure/security-devices.repo';
import { UuidErrorResolver } from '../common/helpers/uuid-error-resolver';
import { PairsGameEntity } from '../features/pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../features/sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../features/pair-game-quiz/entities/challenge-questions.entity';
import { GamePairsRepo } from '../features/pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../features/pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../features/pair-game-quiz/infrastructure/challenges-questions.repo';

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InvalidJwtEntity,
      SecurityDevicesEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
    ]),
    MailsModule,
    CaslModule,
    CqrsModule,
  ],
  controllers: [],
  providers: [
    MailerConfig,
    MailOptionsBuilder,
    PostgresConfig,
    ScheduledTasksService,
    UsersService,
    DataCleanupService,
    UsersRepo,
    UsersRawSqlRepository,
    InvalidJwtRepo,
    SecurityDevicesRepo,
    SentCodeLogRepository,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
  ],
})
export class SchedulingModule {}
