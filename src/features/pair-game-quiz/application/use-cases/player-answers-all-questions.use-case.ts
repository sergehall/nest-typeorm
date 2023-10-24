import { PairsGameEntity } from '../../entities/pairs-game.entity';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import * as uuid4 from 'uuid4';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';
import { UsersEntity } from '../../../users/entities/users.entity';
import { QuestionsQuizEntity } from '../../../sa-quiz-questions/entities/questions-quiz.entity';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';

export class PlayerAnswersAllQuestionsCommand {
  constructor(
    public game: PairsGameEntity,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(PlayerAnswersAllQuestionsCommand)
export class PlayerAnswersAllQuestionsUseCase
  implements ICommandHandler<PlayerAnswersAllQuestionsCommand>
{
  constructor(
    protected gamePairsRepo: GamePairsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected commandBus: CommandBus,
    protected eventBus: EventBus,
  ) {}

  async execute(command: PlayerAnswersAllQuestionsCommand): Promise<boolean> {
    const { game, currentUserDto } = command;
    const TEN_SECONDS = 10000; // 10 seconds in milliseconds

    // Schedule a separate asynchronous operation to finish the game after a 10-second delay
    setTimeout(async () => {
      // After the 10-second delay, update the game status to "FINISHED" and record the finishGameDate
      game.status = StatusGameEnum.FINISHED;
      game.finishGameDate = new Date().toISOString();

      // Save the updated game StatusGameEnum.FINISHED
      await this.gamePairsRepo.saveGame(game);

      // Handle unanswered questions for the other player
      await this.finishForAnotherUser(game, currentUserDto);

      // publish gameOverEvent
      game.events.forEach((e) => {
        this.eventBus.publish(e);
      });
    }, TEN_SECONDS);

    // Return true immediately
    return true;
  }

  // Method to handle unanswered questions by the other player.
  private async finishForAnotherUser(
    game: PairsGameEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<boolean> {
    const anotherUserId =
      game.firstPlayer.userId === currentUserDto.userId
        ? game.secondPlayer!.userId
        : game.firstPlayer.userId;

    // Retrieve challenge answers associated with the game for the other player
    const challengesAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getCountChallengeAnswersByGameIdUserId(
        game.id,
        anotherUserId,
      );

    // Calculate the number of challenge answers
    const countChallengeAnswers = challengesAnswers.length;

    // Retrieve the remaining challenge questions that the other player has not answered
    const remainingQuestions: ChallengeQuestionsEntity[] =
      await this.challengesQuestionsRepo.getRemainingChallengeQuestions(
        game.id,
        countChallengeAnswers,
      );

    const challengeAnswers: ChallengeAnswersEntity[] = [];

    // Create answers arr  with a predefined text for remaining unanswered questions
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
      return true;
    }

    // Save the constructed challenge answers
    await this.challengesAnswersRepo.saveChallengeAnswersEntities(
      challengeAnswers,
    );
    return true;
  }
}
