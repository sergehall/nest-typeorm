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
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';
import { PairsCountPairsDto } from '../dto/pairs-count-pairs.dto';

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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getGamesByUserIdPaging(
    queryData: ParseQueriesDto,
    userId: string,
  ): Promise<PairsCountPairsDto> {
    // Retrieve paging parameters
    const { sortBy, sortDirection, pageSize, pageNumber } =
      queryData.queryPagination;

    const field: string = await this.getSortField(sortBy);
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

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

      queryBuilder.orderBy(`pairsGame.${field}`, direction);

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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
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
        .where('pairsGame.id = :id', {
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
        createdGame = PairsGameEntity.createPairsGameEntity(currentUserDto);
        await this.pairsGameQuizRepo.save(createdGame);

        const challengeQuestions: ChallengeQuestionsEntity[] = [];
        const challengeAnswers: ChallengeAnswersEntity[] = [];
        const challengesQuestion =
          await this.challengesQuestionsRepo.createChallengeQuestions(
            createdGame.id,
          );
        if (challengesQuestion.length === 0) {
          // handle the error if there are not enough questions for the game
        }
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

      createdGame = PairsGameEntity.addSecondPlayer(
        pendingGame,
        currentUserDto,
      );

      await this.pairsGameQuizRepo.save(createdGame);

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

  async saveGameResult(
    game: PairsGameEntity,
    playersData: PlayersResultDto,
  ): Promise<PairsGameEntity> {
    try {
      const updatedGame = PairsGameEntity.updateGameResult(game, playersData);

      // Save the updated game back to the database
      return await this.pairsGameQuizRepo.save(updatedGame);
    } catch (error) {
      console.error(
        'Error update PairsGameQuizEntity by updatePairsGameQuizByResult:',
        error,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async saveGame(game: PairsGameEntity): Promise<PairsGameEntity> {
    try {
      return await this.pairsGameQuizRepo.save(game);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getSortField(sortBy: string): Promise<string> {
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
}
