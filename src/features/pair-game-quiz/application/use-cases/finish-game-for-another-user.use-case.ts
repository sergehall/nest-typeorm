import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { UsersEntity } from '../../../users/entities/users.entity';
import { QuestionsQuizEntity } from '../../../sa-quiz-questions/entities/questions-quiz.entity';
import * as uuid4 from 'uuid4';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';
import { GameOverEvent } from '../../events/game-over.event';

export class FinishGameForAnotherUseCommand {
  constructor(
    public game: PairsGameEntity,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(FinishGameForAnotherUseCommand)
export class FinishGameForAnotherUserUseCase
  implements ICommandHandler<FinishGameForAnotherUseCommand>
{
  constructor(
    protected challengesAnswersRepo: ChallengesAnswersRepo,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
  ) {}

  async execute(
    command: FinishGameForAnotherUseCommand,
  ): Promise<PairsGameEntity> {
    const { game, currentUserDto } = command;

    const anotherUserId =
      game.firstPlayer.userId === currentUserDto.userId
        ? game.secondPlayer!.userId
        : game.firstPlayer.userId;

    const challengesAnswers =
      await this.challengesAnswersRepo.getCountChallengeAnswersByGameIdUserId(
        game.id,
        anotherUserId,
      );

    const countChallengeAnswers = challengesAnswers.length;

    const remainingQuestions =
      await this.challengesQuestionsRepo.getRemainingChallengeQuestions(
        game.id,
        countChallengeAnswers,
      );

    const challengeAnswers: ChallengeAnswersEntity[] = [];

    if (remainingQuestions && remainingQuestions.length > 0) {
      for (const challengeQuestion of remainingQuestions) {
        const answerOwnerEntity = new UsersEntity();
        answerOwnerEntity.userId = anotherUserId;

        const questionsQuizEntity = new QuestionsQuizEntity();
        questionsQuizEntity.id = challengeQuestion.question.id;
        questionsQuizEntity.questionText =
          challengeQuestion.question.questionText;

        const challengeAnswer: ChallengeAnswersEntity =
          new ChallengeAnswersEntity();
        challengeAnswer.id = uuid4();
        challengeAnswer.answer = 'The timer ran out 10 sec.';
        challengeAnswer.answerStatus = AnswerStatusEnum.INCORRECT;
        challengeAnswer.addedAt = new Date().toISOString();
        challengeAnswer.pairGameQuiz = game;
        challengeAnswer.question = questionsQuizEntity;
        challengeAnswer.answerOwner = answerOwnerEntity;

        challengeAnswers.push(challengeAnswer);
      }
    } else {
      console.log('No remaining questions to answer.');
      const event: GameOverEvent = new GameOverEvent(game);
      game.events.push(event);
      return game;
    }

    await this.challengesAnswersRepo.saveChallengeAnswersEntities(
      challengeAnswers,
    );
    const event: GameOverEvent = new GameOverEvent(game);
    game.events.push(event);

    return game;
  }
}
