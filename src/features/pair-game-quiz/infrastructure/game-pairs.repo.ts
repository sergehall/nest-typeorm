import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StatusGameEnum } from '../enums/status-game.enum';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { PairQuestionsAnswersScoresDto } from '../dto/pair-questions-score.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { idFormatError } from '../../../common/filters/custom-errors-messages';
import { PlayersResultDto } from '../dto/players-result.dto';
import { ChallengesQuestionsRepo } from './challenges-questions.repo';
import { PairsGameEntity } from '../entities/pairs-game.entity';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';

export class GamePairsRepo {
  constructor(
    @InjectRepository(PairsGameEntity)
    private readonly pairsGameQuizRepo: Repository<PairsGameEntity>,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected keyResolver: KeyResolver,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async getAllGames(): Promise<PairsGameEntity[]> {
    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where(
          '(pairsGame.status = :activeStatus OR pairsGame.status = :pendingStatus)',
          {
            activeStatus: StatusGameEnum.ACTIVE,
            pendingStatus: StatusGameEnum.FINISHED,
          },
        );
      return await queryBuilder.getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllGamesByUserId(userId: string): Promise<PairsGameEntity[]> {
    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where(
          '(firstPlayer.userId = :userId OR secondPlayer.userId = :userId)',
          {
            userId,
          },
        )
        .andWhere(
          '(pairsGame.status = :activeStatus OR pairsGame.status = :pendingStatus)',
          {
            activeStatus: StatusGameEnum.ACTIVE,
            pendingStatus: StatusGameEnum.FINISHED,
          },
        );
      return await queryBuilder.getMany();
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllGamesByUserIdForDelete(
    userId: string,
  ): Promise<PairsGameEntity[]> {
    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where(
          '(firstPlayer.userId = :userId OR secondPlayer.userId = :userId)',
          {
            userId,
          },
        );
      return await queryBuilder.getMany();
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getGamesByUserIdPaging(
    queryData: ParseQueriesDto,
    userId: string,
  ): Promise<{ pairsGame: PairsGameEntity[]; countPairsGame: number }> {
    // Retrieve paging parameters
    const pagingParams: PagingParamsDto = await this.getPagingParams(queryData);

    const { sortBy, direction, limit, offset } = pagingParams;

    const orderByField = await this.getOrderField(sortBy);

    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where(
          '(firstPlayer.userId = :userId OR secondPlayer.userId = :userId)',
          {
            userId,
          },
        )
        .andWhere(
          '(pairsGame.status = :activeStatus OR pairsGame.status = :pendingStatus)',
          {
            activeStatus: StatusGameEnum.ACTIVE,
            pendingStatus: StatusGameEnum.FINISHED,
          },
        );

      queryBuilder.orderBy(orderByField, direction);

      // Features of sorting the list: if the first criterion (for example, status)
      // has the same values, we sort by pairCreatedDate desc
      queryBuilder.addOrderBy(`pairsGame.pairCreatedDate`, 'DESC');

      const countPairsGame = await queryBuilder.getCount();

      const pairsGame = await queryBuilder.skip(offset).take(limit).getMany();

      if (pairsGame.length === 0) {
        return {
          pairsGame: [],
          countPairsGame: countPairsGame,
        };
      }
      return {
        pairsGame: pairsGame,
        countPairsGame: countPairsGame,
      };
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUnfinishedGameByUserId(
    userId: string,
  ): Promise<PairsGameEntity | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where(
          '(firstPlayer.userId = :userId OR secondPlayer.userId = :userId)',
          {
            userId,
          },
        )
        .andWhere(
          '(pairsGame.status = :activeStatus OR pairsGame.status = :pendingStatus)',
          {
            activeStatus: StatusGameEnum.ACTIVE,
            pendingStatus: StatusGameEnum.PENDING,
          },
        );
      const pair: PairsGameEntity | null = await queryBuilder.getOne();

      return pair ? pair : null;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getActiveGameByUserId(userId: string): Promise<PairsGameEntity | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where(
          '(firstPlayer.userId = :userId OR secondPlayer.userId = :userId)',
          {
            userId,
          },
        )
        .andWhere('(pairsGame.status = :activeStatus)', {
          activeStatus: StatusGameEnum.ACTIVE,
        });
      const pair: PairsGameEntity | null = await queryBuilder.getOne();

      return pair ? pair : null;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getGameByPairId(id: string): Promise<PairsGameEntity | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepo
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .andWhere('pairsGame.id = :id', {
          id,
        });

      const game: PairsGameEntity | null = await queryBuilder.getOne();
      return game ? game : null;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const id = await this.uuidErrorResolver.extractUserIdFromError(error);
        idFormatError.message = idFormatError.message + `ID ${id}`;

        throw new HttpException(
          {
            message: [idFormatError],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPendingPairOrCreateNew(
    currentUserDto: CurrentUserDto,
  ): Promise<PairQuestionsAnswersScoresDto> {
    try {
      let createdGame: PairsGameEntity;

      const pendingGame: PairsGameEntity | null =
        await this.pairsGameQuizRepo.findOne({
          where: {
            status: StatusGameEnum.PENDING,
          },
        });

      if (!pendingGame) {
        createdGame = await this.createPairGameEntity(currentUserDto);
        await this.pairsGameQuizRepo.save(createdGame);

        const challengeQuestions: ChallengeQuestionsEntity[] = [];
        const challengeAnswers: ChallengeAnswersEntity[] = [];
        await this.challengesQuestionsRepo.createChallengeQuestions(
          createdGame.id,
        );

        return {
          pair: createdGame,
          challengeQuestions,
          challengeAnswers,
          scores: {
            firstPlayerCountCorrectAnswer: 0,
            secondPlayerCountCorrectAnswer: 0,
          },
        };
      }

      // if pendingGame.status === StatusGameEnum.PENDING
      createdGame = await this.addSecondPlayerAndStarGame(
        pendingGame,
        currentUserDto,
      );

      const challengeQuestions: ChallengeQuestionsEntity[] =
        await this.challengesQuestionsRepo.getChallengeQuestionsByGameId(
          createdGame.id,
        );

      const challengeAnswers: ChallengeAnswersEntity[] = [];

      return {
        pair: createdGame,
        challengeQuestions,
        challengeAnswers,
        scores: {
          firstPlayerCountCorrectAnswer: 0,
          secondPlayerCountCorrectAnswer: 0,
        },
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePairsGameQuizByResult(
    game: PairsGameEntity,
    newStatus: StatusGameEnum,
    playersData: PlayersResultDto[],
  ): Promise<PairsGameEntity> {
    try {
      const pairsGameQuizRepository = this.pairsGameQuizRepo;

      // Update the first player's data
      game.firstPlayer = playersData[0].player;
      game.firstPlayerScore = playersData[0].sumScore;
      game.firstPlayerGameResult = playersData[0].gameResult;

      // Update the second player's data if provided
      if (playersData[1]) {
        game.secondPlayer = playersData[1].player;
        game.secondPlayerScore = playersData[1].sumScore;
        game.secondPlayerGameResult = playersData[1].gameResult;
      }
      // Update the game's status and add finishGameDate
      game.status = newStatus;
      game.finishGameDate = new Date().toISOString();

      // Save the updated game back to the database
      await pairsGameQuizRepository.save(game);

      return game;
    } catch (error) {
      console.error(
        'Error update PairsGameQuizEntity by updatePairsGameQuizByResult:',
        error,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  private async addSecondPlayerAndStarGame(
    pairGameQuiz: PairsGameEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<PairsGameEntity> {
    const secondPlayer = new UsersEntity();
    secondPlayer.userId = currentUserDto.userId;
    secondPlayer.login = currentUserDto.login;
    pairGameQuiz.secondPlayer = secondPlayer;
    pairGameQuiz.startGameDate = new Date().toISOString();
    pairGameQuiz.status = StatusGameEnum.ACTIVE;

    await this.pairsGameQuizRepo.save(pairGameQuiz);
    return pairGameQuiz;
  }

  private async createPairGameEntity(
    currentUserDto: CurrentUserDto,
  ): Promise<PairsGameEntity> {
    const firstPlayer = new UsersEntity();
    firstPlayer.userId = currentUserDto.userId;
    firstPlayer.login = currentUserDto.login;

    const pairGameQuizEntity = new PairsGameEntity();
    pairGameQuizEntity.id = uuid4();
    pairGameQuizEntity.firstPlayer = firstPlayer;
    pairGameQuizEntity.secondPlayer = null;
    pairGameQuizEntity.pairCreatedDate = new Date().toISOString();
    pairGameQuizEntity.startGameDate = null;
    pairGameQuizEntity.finishGameDate = null;

    return pairGameQuizEntity;
  }

  private async getPagingParams(
    queryData: ParseQueriesDto,
  ): Promise<PagingParamsDto> {
    const { sortDirection, pageSize, pageNumber } = queryData.queryPagination;

    const sortBy: string = await this.getSort(queryData.queryPagination.sortBy);
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
  }

  private async getSort(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'status',
        'startGameDate',
        'finishGameDate',
        'firstPlayerLogin',
        'secondPlayerLogin',
        'firstPlayerScore',
        'secondPlayerScore',
        'firstPlayerGameResult',
        'secondPlayerGameResult',
      ],
      'pairCreatedDate',
    );
  }

  private async getOrderField(field: string): Promise<string> {
    let orderByString;
    try {
      switch (field) {
        case 'status':
          orderByString = 'pairsGame.status';
          break;
        case 'startGameDate':
          orderByString = 'pairsGame.startGameDate';
          break;
        case 'finishGameDate':
          orderByString = 'pairsGame.finishGameDate';
          break;
        case 'firstPlayerLogin':
          orderByString = 'pairsGame.firstPlayerLogin';
          break;
        case 'secondPlayerLogin':
          orderByString = 'pairsGame.secondPlayerLogin';
          break;
        case 'firstPlayerScore':
          orderByString = 'pairsGame.firstPlayerScore';
          break;
        case 'secondPlayerScore':
          orderByString = 'pairsGame.secondPlayerScore';
          break;
        case 'firstPlayerGameResult':
          orderByString = 'pairsGame.firstPlayerGameResult';
          break;
        case 'secondPlayerGameResult':
          orderByString = 'pairsGame.secondPlayerGameResult';
          break;
        default:
          orderByString = 'pairsGame.pairCreatedDate';
      }

      return orderByString;
    } catch (error) {
      console.log(error.message);
      throw new Error('Invalid field in getOrderField(field: string)');
    }
  }
}
