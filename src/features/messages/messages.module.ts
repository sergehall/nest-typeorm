import { Module } from '@nestjs/common';
import { MessagesService } from './application/messages.service';
import { MessagesController } from './api/messages.controller';
import { MessagesRepo } from './infrastructure/messages.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesEntity } from './entities/messages.entity';
import { ConversationsRepo } from './infrastructure/conversations.repo';
import { ConversationsEntity } from './entities/conversations.entity';
import { SocketGateway } from '../../socket/socket.gateway';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersEntity } from '../users/entities/users.entity';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { JwtConfig } from '../../config/jwt/jwt.config';
import { CqrsModule } from '@nestjs/cqrs';
import { ValidSocketHandshake } from '../../socket/validation/valid-socket-handshake';

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessagesEntity,
      ConversationsEntity,
      UsersEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
    ]),
    CqrsModule,
  ],
  controllers: [MessagesController],
  providers: [
    ValidSocketHandshake,
    JwtConfig,
    MessagesService,
    ConversationsRepo,
    MessagesRepo,
    SocketGateway,
    UsersRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
  ],
})
export class MessagesModule {}
