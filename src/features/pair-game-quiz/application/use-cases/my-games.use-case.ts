import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameViewModel } from '../../views/game.view-model';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { CountCorrectAnswerDto } from '../../dto/correct-answer-counts-and-bonus.dto';
import { PairGameQuizService } from '../pair-game-quiz.service';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

export class GetMyGamesCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(GetMyGamesCommand)
export class GetMyGamesUseCase implements ICommandHandler<GetMyGamesCommand> {
  constructor(
    protected mapPairGame: MapPairGame,
    protected gamePairsRepo: GamePairsRepo,
    protected pairGameQuizService: PairGameQuizService,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
  ) {}
  async execute(command: GetMyGamesCommand): Promise<PaginatorDto> {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const gamesAndCount = await this.gamePairsRepo.getGamesByUserIdPaging(
      queryData,
      currentUserDto.userId,
    );

    const { pairsGame, countPairsGame } = gamesAndCount;

    if (countPairsGame === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }
    const pagesCount = Math.ceil(countPairsGame / pageSize);

    const modelsGames = await this.createGameModels(pairsGame);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: countPairsGame,
      items: modelsGames,
    };
  }

  private async createGameModels(
    games: PairsGameEntity[],
  ): Promise<GameViewModel[]> {
    const gameIds = games
      .filter((game) => game.status === StatusGameEnum.FINISHED)
      .map((game) => game.id);

    let questionsFinishedGames: ChallengeQuestionsEntity[] = [];
    let answersFinishedGames: ChallengeAnswersEntity[] = [];

    if (gameIds.length !== 0) {
      [questionsFinishedGames, answersFinishedGames] = await Promise.all([
        this.getChallengeQuestionsFinishedGames(gameIds),
        this.getChallengeAnswersFinishedGames(gameIds),
      ]);
    }

    const pairsGame: GameViewModel[] = [];

    for (const game of games) {
      if (game.status === StatusGameEnum.PENDING) {
        pairsGame.push(await this.createGameModelForPending(game));
      } else if (game.status === StatusGameEnum.ACTIVE) {
        pairsGame.push(await this.createGameModelForActive(game));
      } else if (game.status === StatusGameEnum.FINISHED) {
        pairsGame.push(
          await this.createGameModelForFinished(
            game,
            questionsFinishedGames,
            answersFinishedGames,
          ),
        );
      }
    }
    return pairsGame;
  }

  private async createGameModelForPending(
    game: PairsGameEntity,
  ): Promise<GameViewModel> {
    const challengeQuestions: ChallengeQuestionsEntity[] = [];
    const challengeAnswers: ChallengeAnswersEntity[] = [];

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers,
      scores: {
        firstPlayerCountCorrectAnswer: 0,
        secondPlayerCountCorrectAnswer: 0,
      },
    });
  }

  private async createGameModelForActive(
    game: PairsGameEntity,
  ): Promise<GameViewModel> {
    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(game.id);

    const currentScores: CountCorrectAnswerDto =
      await this.pairGameQuizService.getScores(game, challengeAnswers);

    const challengeQuestions: ChallengeQuestionsEntity[] =
      await this.challengesQuestionsRepo.getChallengeQuestionsByGameId(game.id);

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers: challengeAnswers,
      scores: currentScores,
    });
  }

  private async createGameModelForFinished(
    game: PairsGameEntity,
    questionsFinishedGames: ChallengeQuestionsEntity[],
    answersFinishedGames: ChallengeAnswersEntity[],
  ): Promise<GameViewModel> {
    const challengeAnswers = answersFinishedGames.filter(
      (challengeAnswer) => challengeAnswer.pairGameQuiz.id === game.id,
    );

    const currentScores: CountCorrectAnswerDto = {
      firstPlayerCountCorrectAnswer: game.firstPlayerScore,
      secondPlayerCountCorrectAnswer: game.secondPlayerScore,
    };

    const challengeQuestions: ChallengeQuestionsEntity[] =
      questionsFinishedGames.filter(
        (challengeQuestion) => challengeQuestion.pairGameQuiz.id === game.id,
      );

    return this.mapPairGame.toGameModel({
      pair: game,
      challengeQuestions,
      challengeAnswers: challengeAnswers,
      scores: currentScores,
    });
  }

  private async getChallengeAnswersFinishedGames(
    gameIds: string[],
  ): Promise<ChallengeAnswersEntity[]> {
    return await this.challengesAnswersRepo.getChallengeAnswersByIds(gameIds);
  }

  private async getChallengeQuestionsFinishedGames(
    gameIds: string[],
  ): Promise<ChallengeQuestionsEntity[]> {
    return await this.challengesQuestionsRepo.getChallengeQuestionsByGameIds(
      gameIds,
    );
  }
}
