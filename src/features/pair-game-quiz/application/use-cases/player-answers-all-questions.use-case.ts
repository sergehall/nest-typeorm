import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import uuid4 from 'uuid4';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';
import { UsersEntity } from '../../../users/entities/users.entity';
import { QuestionsQuizEntity } from '../../../sa-quiz-questions/entities/questions-quiz.entity';
import { StatusGameEnum } from '../../enums/status-game.enum';

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
    const TEN_SECONDS = 20000; // 10 seconds in milliseconds
    console.log(TEN_SECONDS, 'TEN_SECONDS-------TEN_SECONDS');
    // Schedule a separate asynchronous operation for saveGame after a 10-second delay
    setTimeout(async () => {
      // After the 10-second delay, update the game status and finishGameDate
      game.version = game.version + 1;

      game.status = StatusGameEnum.FINISHED;
      game.finishGameDate = new Date().toISOString();

      console.log(game, 'game');

      // game.version = game.version + 1;
      const saveGame = await this.gamePairsRepo.saveGame(game);

      console.log(saveGame, 'saveGame');
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
  ) {
    const anotherUserId =
      game.firstPlayer.userId === currentUserDto.userId
        ? game.firstPlayer.userId
        : game.secondPlayer!.userId;

    const challengesAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getCountChallengeAnswersByGameIdUserId(
        game.id,
        anotherUserId,
      );

    const countChallengeAnswers = challengesAnswers.length;

    const remainingQuestion =
      await this.challengesQuestionsRepo.getRemainingChallengeQuestions(
        game.id,
        countChallengeAnswers,
      );

    const challengeAnswers: ChallengeAnswersEntity[] = [];

    if (remainingQuestion && remainingQuestion.length > 0) {
      for (const question of remainingQuestion) {
        const answerOwnerEntity = new UsersEntity();
        answerOwnerEntity.userId = anotherUserId;

        const questionsQuizEntity = new QuestionsQuizEntity();
        questionsQuizEntity.id = question.id;
        questionsQuizEntity.questionText = question.question.questionText;

        const challengeAnswer = new ChallengeAnswersEntity();
        challengeAnswer.id = uuid4();
        challengeAnswer.answer = 'No answer';
        challengeAnswer.answerStatus = AnswerStatusEnum.INCORRECT;
        challengeAnswer.addedAt = new Date().toISOString();
        challengeAnswer.pairGameQuiz = game;
        challengeAnswer.question = questionsQuizEntity; // Use the current question
        challengeAnswer.answerOwner = answerOwnerEntity;

        challengeAnswers.push(challengeAnswer);
      }
    } else {
      console.log('No remaining questions to answer.');
    }
    // if (allGames.length > 0) {
    //   const deleteChallengeQuestionsPromise = transactionalEntityManager
    //     .createQueryBuilder()
    //     .delete()
    //     .from('challengeQuestions')
    //     .where('pairGameQuizId IN (:...gameIds)', { gameIds: allGamesIds })
    //     .execute();
    //
    //   // Other promises for data deletion can be added here if needed
    //
    //   await Promise.all([
    //     deleteChallengeQuestionsPromise,
    //     // Add other promises for data deletion here if needed
    //   ]);
    // }
    await this.challengesAnswersRepo.saveEntities(challengeAnswers);
    return true;
  }
}
