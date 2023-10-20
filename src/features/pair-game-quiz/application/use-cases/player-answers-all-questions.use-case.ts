import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import { AddResultToPairGameCommand } from './add-result-to-pair-game.use-case';

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
  ) {}

  async execute(command: PlayerAnswersAllQuestionsCommand): Promise<boolean> {
    const { game, currentUserDto } = command;
    const TEN_SECONDS = 10000; // 10 seconds in milliseconds
    console.log('TEN_SECONDS start');
    // Schedule a separate asynchronous operation for saveGame after a 10-second delay
    setTimeout(async () => {
      // After the 10-second delay, update the game status StatusGameEnum.FINISHED and finishGameDate
      console.log('TEN_SECONDS end');
      game.status = StatusGameEnum.FINISHED;
      game.finishGameDate = new Date().toISOString();

      await this.gamePairsRepo.saveGame(game);

      await this.finishForAnotherUser(game, currentUserDto);

      await this.commandBus.execute(new AddResultToPairGameCommand(game));
    }, TEN_SECONDS);

    // Return true immediately
    return true;
  }

  // async execute(command: PlayerAnswersAllQuestionsCommand): Promise<boolean> {
  //   const { game, currentUserDto } = command;
  //   const TEN_SECONDS = 10000; // 10 seconds in milliseconds
  //
  //   return new Promise<boolean>((resolve) => {
  //     setTimeout(async () => {
  //       // Timer has expired, update the game status and finishGameDate.
  //       // game.status = StatusGameEnum.FINISHED;
  //       // game.finishGameDate = new Date().toISOString();
  //
  //       console.log(game, 'game');
  //
  //       game.version = game.version + 1;
  //       const saveGame = await this.gamePairsRepo.saveGame(game);
  //
  //       console.log(saveGame, 'saveGame');
  //
  //       // await this.finishForAnotherUser(game, currentUserDto);
  //
  //       // await this.commandBus.execute(new AddResultToPairGameCommand(game));
  //
  //       resolve(true); // Resolve the promise when the changes are saved and questions are checked.
  //     }, TEN_SECONDS);
  //   });
  // }

  // New method to check unanswered questions by the second user.
  private async finishForAnotherUser(
    game: PairsGameEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<boolean> {
    const anotherUserId =
      game.firstPlayer.userId === currentUserDto.userId
        ? game.secondPlayer!.userId
        : game.firstPlayer.userId;

    const challengesAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getCountChallengeAnswersByGameIdUserId(
        game.id,
        anotherUserId,
      );

    const countChallengeAnswers = challengesAnswers.length;

    const remainingQuestions: ChallengeQuestionsEntity[] =
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
    }

    await this.challengesAnswersRepo.saveChallengeAnswersEntities(
      challengeAnswers,
    );
    return true;
  }
}
