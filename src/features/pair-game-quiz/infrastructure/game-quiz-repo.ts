import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ComplexityEnums } from '../enums/complexity.enums';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import * as crypto from 'crypto';
import { StatusGameEnum } from '../enums/status-game.enum';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';
import { dictionaryQuestions } from '../questions/dictionary-questions';
import { CreateQuizQuestionDto } from '../../sa-quiz-questions/dto/create-quiz-question.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { QuestionsAndCountDto } from '../../sa-quiz-questions/dto/questions-and-count.dto';
import { UpdateQuizQuestionDto } from '../../sa-quiz-questions/dto/update-quiz-question.dto';
import { UpdatePublishDto } from '../../sa-quiz-questions/dto/update-publish.dto';
import { AnswerStatusEnum } from '../enums/answer-status.enum';
import { PairQuestionsScoreDto } from '../dto/pair-questions-score.dto';
import { CorrectAnswerCountsAndBonusDto } from '../dto/correct-answer-counts-and-bonus.dto';

export class GameQuizRepo {
  constructor(
    @InjectRepository(QuestionsQuizEntity)
    private readonly questionsRepository: Repository<QuestionsQuizEntity>,
    @InjectRepository(PairsGameQuizEntity)
    private readonly pairsGameQuizRepository: Repository<PairsGameQuizEntity>,
    @InjectRepository(ChallengeQuestionsEntity)
    private readonly challengeQuestionsRepository: Repository<ChallengeQuestionsEntity>,
    @InjectRepository(ChallengeAnswersEntity)
    private readonly challengeAnswersRepository: Repository<ChallengeAnswersEntity>,
    protected keyResolver: KeyResolver,
  ) {}

  async getGameByUserId(userId: string): Promise<PairsGameQuizEntity | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepository
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where('firstPlayer.userId = :userId', {
          userId,
        })
        .orWhere('pairsGame.secondPlayerId = :userId', {
          userId,
        });

      const pair: PairsGameQuizEntity | null = await queryBuilder.getOne();

      return pair ? pair : null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCurrentGameByUserId(
    userId: string,
  ): Promise<PairsGameQuizEntity | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepository
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where('firstPlayer.userId = :userId', {
          userId,
        })
        .orWhere('pairsGame.secondPlayerId = :userId', {
          userId,
        })
        .andWhere('pairsGame.status = :status', {
          status: StatusGameEnum.COMPETING,
        });

      const pair: PairsGameQuizEntity | null = await queryBuilder.getOne();

      return pair ? pair : null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getGameByPairId(id: string): Promise<PairsGameQuizEntity | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepository
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .andWhere('pairsGame.id = :id', {
          id,
        });

      const game: PairsGameQuizEntity | null = await queryBuilder.getOne();
      return game ? game : null;
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getQuestionById(id: string): Promise<QuestionsQuizEntity | null> {
    try {
      const queryBuilder = this.questionsRepository
        .createQueryBuilder('questionsQuiz')
        .where('questionsQuiz.id = :id', {
          id,
        })
        .andWhere('questionsQuiz.published = :published', {
          published: false,
        });

      const questionsQuizEntity: QuestionsQuizEntity | null =
        await queryBuilder.getOne();

      return questionsQuizEntity ? questionsQuizEntity : null;
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Questions with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async verifyAnswerByQuestionsId(
    id: string,
    answer: string,
  ): Promise<boolean> {
    try {
      const queryBuilder = this.questionsRepository
        .createQueryBuilder('questionsQuiz')
        .where('questionsQuiz.id = :id', {
          id,
        });

      const questionsQuizEntity: QuestionsQuizEntity | null =
        await queryBuilder.getOne();

      return !!(
        questionsQuizEntity &&
        questionsQuizEntity.hashedAnswers.includes(answer)
      );
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Questions with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getNextQuestionsToGame(
    game: PairsGameQuizEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<PairQuestionsScoreDto> {
    try {
      const countAnswers = await this.getCountAnswers(
        game.id,
        currentUserDto.userId,
      );
      const challengeQuestions: ChallengeQuestionsEntity[] =
        await this.getChallengeQuestions(game.id, countAnswers);

      return {
        pair: game,
        challengeQuestions,
        scores: {
          currentUserCorrectAnswerCount: 0,
          competitorCorrectAnswerCount: 0,
        },
      };
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateChallengeAnswers(
    answer: string,
    nextQuestions: ChallengeQuestionsEntity,
    answerStatus: AnswerStatusEnum,
    currentUserDto: CurrentUserDto,
  ): Promise<ChallengeAnswersEntity> {
    const pairsGameQuizEntity = new PairsGameQuizEntity();
    pairsGameQuizEntity.id = nextQuestions.pairGameQuiz.id;

    const questionsQuizEntity = new QuestionsQuizEntity();
    questionsQuizEntity.id = nextQuestions.question.id;
    questionsQuizEntity.questionText = nextQuestions.question.questionText;

    const answerOwnerEntity = new UsersEntity();
    answerOwnerEntity.userId = currentUserDto.userId;

    const challengeAnswer = new ChallengeAnswersEntity();

    try {
      challengeAnswer.id = uuid4();
      challengeAnswer.answer = answer;
      challengeAnswer.answerStatus = answerStatus;
      challengeAnswer.addedAt = new Date().toISOString();
      challengeAnswer.pairGameQuiz = pairsGameQuizEntity;
      challengeAnswer.question = questionsQuizEntity;
      challengeAnswer.answerOwner = answerOwnerEntity;

      await this.challengeAnswersRepository.save(challengeAnswer);

      return challengeAnswer;
    } catch (error) {
      console.error('Error inserting answer into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getGameAndQuestionsForUser(
    currentUserDto: CurrentUserDto,
  ): Promise<PairQuestionsScoreDto | null> {
    try {
      const queryBuilder = this.pairsGameQuizRepository
        .createQueryBuilder('pairsGame')
        .leftJoinAndSelect('pairsGame.firstPlayer', 'firstPlayer')
        .leftJoinAndSelect('pairsGame.secondPlayer', 'secondPlayer')
        .where('firstPlayer.userId = :userId', {
          userId: currentUserDto.userId,
        })
        .orWhere('pairsGame.secondPlayerId = :userId', {
          userId: currentUserDto.userId,
        });

      const game: PairsGameQuizEntity | null = await queryBuilder.getOne();

      if (!game) {
        return null;
      }

      if (game.status === StatusGameEnum.PENDING) {
        const challengeQuestions: ChallengeQuestionsEntity[] = [];
        return {
          pair: game,
          challengeQuestions,
          scores: {
            currentUserCorrectAnswerCount: 0,
            competitorCorrectAnswerCount: 0,
          },
        };
      }

      const countAnswers = await this.getCountAnswers(
        game.id,
        currentUserDto.userId,
      );

      const currentScores: CorrectAnswerCountsAndBonusDto =
        await this.getScores(game.id, currentUserDto.userId);

      // if (game.firstPlayer.userId === currentUserDto.userId) {
      //   game;
      //   return { pair: game, challengeQuestions, score: currentScore };
      // }

      const challengeQuestions: ChallengeQuestionsEntity[] =
        await this.getChallengeQuestions(game.id, countAnswers);

      return { pair: game, challengeQuestions, scores: currentScores };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPendingPairOrCreateNew(
    currentUserDto: CurrentUserDto,
  ): Promise<PairQuestionsScoreDto> {
    try {
      const pendingGame: PairsGameQuizEntity | null =
        await this.pairsGameQuizRepository.findOne({
          where: {
            status: StatusGameEnum.PENDING,
          },
        });

      let createdGame: PairsGameQuizEntity;

      if (!pendingGame) {
        createdGame = await this.createPairGameEntity(currentUserDto);

        await this.pairsGameQuizRepository.save(createdGame);

        const challengeQuestions: ChallengeQuestionsEntity[] = [];
        await this.createChallengeQuestions(createdGame.id);

        return {
          pair: createdGame,
          challengeQuestions,
          scores: {
            currentUserCorrectAnswerCount: 0,
            competitorCorrectAnswerCount: 0,
          },
        };
      }

      createdGame = await this.addSecondPlayerAndStarGame(
        pendingGame,
        currentUserDto,
      );

      const countAnswers = 0;

      const challengeQuestions: ChallengeQuestionsEntity[] =
        await this.getChallengeQuestions(createdGame.id, countAnswers);

      return {
        pair: createdGame,
        challengeQuestions,
        scores: {
          currentUserCorrectAnswerCount: 0,
          competitorCorrectAnswerCount: 0,
        },
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saUpdateQuestionPublish(
    question: QuestionsQuizEntity,
    updatePublishDto: UpdatePublishDto,
  ): Promise<boolean> {
    try {
      question.published = updatePublishDto.published;
      question.updatedAt = new Date().toISOString();

      // Save updated question to the database
      await this.questionsRepository.save(question);

      return true;
    } catch (error) {
      console.error('Error inserting questions into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saUpdateQuestionAndAnswers(
    question: QuestionsQuizEntity,
    updateQuizQuestionDto: UpdateQuizQuestionDto,
  ): Promise<boolean> {
    try {
      // const hashedAnswers = await this.stringsToHashes(
      //   updateQuizQuestionDto.correctAnswers,
      //   20,
      // );
      // question.hashedAnswers = hashedAnswers;

      question.questionText = updateQuizQuestionDto.body;
      question.hashedAnswers = updateQuizQuestionDto.correctAnswers;
      question.updatedAt = new Date().toISOString();

      // Save updated question to the database
      await this.questionsRepository.save(question);

      return true;
    } catch (error) {
      console.error('Error inserting questions into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saCreateQuestion(
    createQuizQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuestionsQuizEntity> {
    try {
      const question = createQuizQuestionDto.body;

      // const hashedAnswers = await this.stringsToHashes(createQuizQuestionDto.correctAnswers, 20);

      const newQuestion = new QuestionsQuizEntity();
      // newQuestion.hashedAnswers = hashedAnswers;
      newQuestion.questionText = question;
      newQuestion.hashedAnswers = createQuizQuestionDto.correctAnswers;
      newQuestion.complexity = ComplexityEnums.EASY;
      newQuestion.published = false;
      newQuestion.createdAt = new Date().toISOString();

      // Save the question to the database
      await this.questionsRepository.save(newQuestion);

      return newQuestion;
    } catch (error) {
      console.error('Error inserting questions into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getScores(
    pairGameQuizId: string,
    userId: string,
  ): Promise<CorrectAnswerCountsAndBonusDto> {
    const queryBuilder = this.challengeAnswersRepository
      .createQueryBuilder('challengeAnswers')
      .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
      .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
      .where('challengeAnswers.pairGameQuizId = :pairGameQuizId', {
        pairGameQuizId,
      })
      .orderBy('challengeAnswers.addedAt', 'ASC');

    const answerArray = await queryBuilder.getMany();
    console.log(answerArray);
    const correctAnswerCounts: CorrectAnswerCountsAndBonusDto =
      answerArray.reduce(
        (counts, answer) => {
          if (answer.answerStatus === AnswerStatusEnum.CORRECT) {
            if (answer.answerOwner.userId === userId) {
              counts.currentUserCorrectAnswerCount++;
            } else {
              counts.competitorCorrectAnswerCount++;
            }
          }
          return counts;
        },
        { currentUserCorrectAnswerCount: 0, competitorCorrectAnswerCount: 0 },
      );

    // Apply bonus points
    const bonusPointForCurrentUser =
      answerArray[0].answerOwner.userId === userId ? 1 : 0;
    const bonusPointCompetitor: number = bonusPointForCurrentUser === 0 ? 1 : 0;

    correctAnswerCounts.currentUserCorrectAnswerCount +=
      bonusPointForCurrentUser;
    correctAnswerCounts.competitorCorrectAnswerCount += bonusPointCompetitor;

    return correctAnswerCounts;
  }

  // async getScores(
  //   pairGameQuizId: string,
  //   userId: string,
  // ): Promise<CorrectAnswerCountsAndBonusDto> {
  //   const queryBuilder = this.challengeAnswersRepository
  //     .createQueryBuilder('challengeAnswers')
  //     .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
  //     .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
  //     .where('challengeAnswers.pairGameQuizId = :pairGameQuizId', {
  //       pairGameQuizId,
  //     })
  //     .orderBy('challengeAnswers.addedAt', 'DESC');
  //
  //   const answerArray = await queryBuilder.getMany();
  //
  //   const correctAnswerCounts: CorrectAnswerCountsAndBonusDto =
  //     answerArray.reduce(
  //       (counts, answer) => {
  //         if (answer.answerStatus === 'Correct') {
  //           if (answer.answerOwner.userId === userId) {
  //             counts.currentUserCorrectAnswerCount++;
  //           } else {
  //             counts.competitorCorrectAnswerCount++;
  //           }
  //         }
  //         return counts;
  //       },
  //       { currentUserCorrectAnswerCount: 0, competitorCorrectAnswerCount: 0 },
  //     );
  //
  //   const bonusPointForCurrentUser =
  //     answerArray[0].answerOwner.userId === userId ? 1 : 0;
  //   let bonusPointCompetitor: number = 0;
  //   if (!bonusPointForCurrentUser) {
  //     bonusPointCompetitor++;
  //   }
  //   correctAnswerCounts.currentUserCorrectAnswerCount +
  //     bonusPointForCurrentUser;
  //   correctAnswerCounts.competitorCorrectAnswerCount + bonusPointCompetitor;
  //
  //   return correctAnswerCounts;
  // }

  async getCountAnswers(
    pairGameQuizId: string,
    userId: string,
  ): Promise<number> {
    const queryBuilder = this.challengeAnswersRepository
      .createQueryBuilder('challengeAnswers')
      .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
      .leftJoinAndSelect('challengeAnswers.question', 'question')
      .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
      .where('challengeAnswers.pairGameQuizId = :pairGameQuizId', {
        pairGameQuizId,
      })
      .andWhere('challengeAnswers.answerOwnerId = :userId', {
        userId,
      });

    return await queryBuilder.getCount();
  }

  private async addSecondPlayerAndStarGame(
    pairGameQuiz: PairsGameQuizEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<PairsGameQuizEntity> {
    const secondPlayer = new UsersEntity();
    secondPlayer.userId = currentUserDto.userId;
    secondPlayer.login = currentUserDto.login;
    pairGameQuiz.secondPlayer = secondPlayer;

    pairGameQuiz.pairCreatedDate = new Date().toISOString();
    pairGameQuiz.startGameDate = new Date().toISOString();

    pairGameQuiz.status = StatusGameEnum.COMPETING;

    await this.pairsGameQuizRepository.save(pairGameQuiz);
    return pairGameQuiz;
  }

  private async createPairGameEntity(
    currentUserDto: CurrentUserDto,
  ): Promise<PairsGameQuizEntity> {
    const firstPlayer = new UsersEntity();
    firstPlayer.userId = currentUserDto.userId;
    firstPlayer.login = currentUserDto.login;

    const pairGameQuizEntity = new PairsGameQuizEntity();
    pairGameQuizEntity.id = uuid4();
    pairGameQuizEntity.firstPlayer = firstPlayer;
    pairGameQuizEntity.secondPlayer = null;
    pairGameQuizEntity.pairCreatedDate = null;
    pairGameQuizEntity.startGameDate = null;
    pairGameQuizEntity.finishGameDate = null;

    return pairGameQuizEntity;
  }

  async saGetQuestions(
    queryData: ParseQueriesDto,
  ): Promise<QuestionsAndCountDto> {
    const bodySearchTerm = queryData.bodySearchTerm;
    // Retrieve paging parameters
    const pagingParams: PagingParamsDto = await this.getPagingParams(queryData);
    const { sortBy, direction, limit, offset } = pagingParams;

    // Retrieve the order field for sorting
    const orderByField = await this.getOrderField(sortBy);

    try {
      const queryBuilder = this.questionsRepository
        .createQueryBuilder('questionsQuiz')
        .where('questionsQuiz.questionText ILIKE :bodySearchTerm', {
          bodySearchTerm,
        })
        .orderBy(`questionsQuiz.${orderByField}`, direction);

      const questions: QuestionsQuizEntity[] = await queryBuilder
        .skip(offset)
        .take(limit)
        .getMany();

      const countQuestions = await queryBuilder.getCount();

      if (questions.length === 0) {
        return {
          questions: [],
          countQuestions: countQuestions,
        };
      }

      return { questions, countQuestions };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getOrderField(field: string): Promise<string> {
    let orderByString;
    try {
      switch (field) {
        case 'complexity':
          orderByString = 'complexity';
          break;
        case 'topic':
          orderByString = 'topic';
          break;
        case 'published':
          orderByString = 'published ';
          break;
        case 'body':
          orderByString = 'questionText';
          break;
        default:
          orderByString = 'createdAt';
      }

      return orderByString;
    } catch (error) {
      console.log(error.message);
      throw new Error('Invalid field in getOrderField(field: string)');
    }
  }

  private async getChallengeQuestions(
    pairGameQuizId: string,
    countAnswers: number,
  ): Promise<ChallengeQuestionsEntity[]> {
    try {
      return await this.challengeQuestionsRepository
        .createQueryBuilder('challengeQuestions')
        .leftJoinAndSelect('challengeQuestions.pairGameQuiz', 'pairGameQuiz')
        .leftJoinAndSelect('challengeQuestions.question', 'question')
        .where('pairGameQuiz.id = :pairGameQuizId', { pairGameQuizId })
        .orderBy('challengeQuestions.createdAt', 'DESC')
        .take(countAnswers + 1)
        .getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createChallengeQuestions(
    pairGameQuizId: string,
  ): Promise<ChallengeQuestionsEntity[]> {
    const numberQuestions = 5;

    const challengeQuestions: ChallengeQuestionsEntity[] = [];

    const questions: QuestionsQuizEntity[] =
      await this.getQuestionsByComplexity(numberQuestions);

    const pairGameQuizEntity = new PairsGameQuizEntity();
    pairGameQuizEntity.id = pairGameQuizId;

    // questionsIds to change the published status in the selected questions
    const questionsIds: string[] = [];

    // Use map to create an array of promises for saving ChallengeQuestionsEntities
    const savePromises = questions.map(async (question) => {
      questionsIds.push(question.id);
      const challengeQuestion: ChallengeQuestionsEntity = {
        id: uuid4(), // Make sure uuid4() generates a valid UUID
        pairGameQuiz: pairGameQuizEntity,
        question: question,
        createdAt: new Date().toISOString(),
      };

      // Save the challengeQuestion entity to the repository
      await this.challengeQuestionsRepository.save(challengeQuestion);

      // Push the saved entity to the array
      challengeQuestions.push(challengeQuestion);
      return challengeQuestion; // Return the saved entity as a promise
    });

    // Wait for all promises to complete
    await Promise.all(savePromises);

    await this.updatePublishedStatus(questionsIds);

    // Return the array of saved ChallengeQuestionsEntities
    return challengeQuestions;
  }

  private async updatePublishedStatus(ids: string[]): Promise<void> {
    try {
      // Start a transaction
      await this.questionsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Use the query builder to update records
          await transactionalEntityManager
            .createQueryBuilder()
            .update(QuestionsQuizEntity)
            .set({ published: true })
            .whereInIds(ids)
            .execute();
        },
      );

      console.log(`Updated published status for ${ids.length} records.`);
    } catch (error) {
      console.error('Error updating published status:', error);
      throw error;
    }
  }

  private async getQuestionsByComplexity(
    numberQuestions: number,
  ): Promise<QuestionsQuizEntity[]> {
    const complexityLevels = [
      ComplexityEnums.EASY,
      ComplexityEnums.MEDIUM,
      ComplexityEnums.DIFFICULT,
    ];

    const questionsPerLevel = 2; // Adjust as needed

    const randomQuestions: QuestionsQuizEntity[] = [];

    for (const complexity of complexityLevels) {
      const levelQuestions = await this.questionsRepository
        .createQueryBuilder('questionsQuiz')
        .where('questionsQuiz.complexity = :complexity', { complexity })
        .andWhere('questionsQuiz.published = :published', { published: false })
        .orderBy('RANDOM()')
        .limit(questionsPerLevel)
        .getMany();

      randomQuestions.push(...levelQuestions);
    }

    // Shuffle the combined results
    randomQuestions.sort(() => Math.random() - 0.5);

    // Return the first 'numberQuestions' questions
    return randomQuestions.slice(0, numberQuestions);
  }

  async createAndSaveQuestion(): Promise<boolean> {
    try {
      // Loop through each complexity level (easy, medium, difficult)
      for (const complexity of [
        ComplexityEnums.EASY,
        ComplexityEnums.MEDIUM,
        ComplexityEnums.DIFFICULT,
      ]) {
        const questions = dictionaryQuestions[complexity];

        // Loop through the questions and insert them into the database
        for (const question of questions) {
          // const hashedAnswers = await this.stringsToHashes(
          //   question.answers,
          //   20,
          // );
          const newQuestion = new QuestionsQuizEntity();
          newQuestion.questionText = question.question;
          newQuestion.hashedAnswers = question.answers;
          newQuestion.complexity = question.complexity;
          newQuestion.topic = question.topic;
          newQuestion.published = false;
          newQuestion.createdAt = new Date().toISOString();

          // Save the question to the database
          await this.questionsRepository.save(newQuestion);
        }
      }
      return true;
    } catch (error) {
      console.error('Error inserting questions into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saDeleteQuestionById(id: string): Promise<boolean> {
    try {
      await this.questionsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await this.deleteQuestionsData(id, transactionalEntityManager);
        },
      );
      return true;
    } catch (error) {
      console.error(
        `Error while removing data for question id: ${error.message}`,
      );
      throw new Error(`Error while removing data for question id`);
    }
  }

  private async deleteQuestionsData(
    questionId: string,
    entityManager: EntityManager,
  ): Promise<void> {
    try {
      await Promise.all([
        await entityManager
          .createQueryBuilder()
          .delete()
          .from('ChallengeQuestions', 'challengeQuestions')
          .where('questionId = :questionId', { questionId })
          .execute(),
        await entityManager
          .createQueryBuilder()
          .delete()
          .from('ChallengeAnswers', 'challengeAnswers')
          .where('questionId = :questionId', { questionId })
          .execute(),
      ]);
      await entityManager
        .createQueryBuilder()
        .delete()
        .from('QuestionsQuiz', 'challengeAnswers')
        .where('id = :questionId', { questionId })
        .execute();
    } catch (error) {
      console.error(
        `Error while removing data for question id ${questionId}: ${error.message}`,
      );
      throw new Error(
        `Error while removing data for question id ${questionId}`,
      );
    }
  }

  private async stringsToHashes(
    answers: string[],
    hashLength: number,
  ): Promise<string[]> {
    const hashedArray: string[] = [];

    for (const answer of answers) {
      const hash = crypto.createHash('sha256').update(answer).digest('hex');
      hashedArray.push(hash.substring(0, hashLength));
    }

    return hashedArray;
  }

  private async hashToString(
    hash: string,
    answers: string[],
  ): Promise<string | null> {
    for (const answer of answers) {
      const computedHash = crypto
        .createHash('sha256')
        .update(answer)
        .digest('hex');
      if (computedHash === hash) {
        return answer;
      }
    }
    return null; // Hash doesn't match any of the original strings
  }

  private async hashesToStrings(
    hashes: string[],
    answers: string[],
  ): Promise<string[]> {
    const matchedStrings: string[] = [];

    for (const hash of hashes) {
      for (const answer of answers) {
        const computedHash = crypto
          .createHash('sha256')
          .update(answer)
          .digest('hex');
        if (computedHash === hash) {
          matchedStrings.push(answer);
          break; // Break the inner loop once a match is found for the current hash
        }
      }
    }

    return matchedStrings;
  }

  private async isInvalidUUIDError(error: any): Promise<boolean> {
    return error.message.includes('invalid input syntax for type uuid');
  }

  private async extractUserIdFromError(error: any): Promise<string | null> {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }

  private async getPagingParams(
    queryData: ParseQueriesDto,
  ): Promise<PagingParamsDto> {
    const { sortDirection, pageSize, pageNumber } = queryData.queryPagination;

    const sortBy: string = await this.getSortBy(
      queryData.queryPagination.sortBy,
    );
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      ['complexity', 'topic', 'published', 'bodySearchTerm'],
      'createdAt',
    );
  }
}
