import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { Repository } from 'typeorm';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { AnswerStatusEnum } from '../enums/answer-status.enum';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { PairsGameEntity } from '../entities/pairs-game.entity';

export class ChallengesAnswersRepo {
  constructor(
    @InjectRepository(ChallengeAnswersEntity)
    private readonly challengeAnswersRepo: Repository<ChallengeAnswersEntity>,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async saveChallengeAnswer(
    answer: string,
    nextQuestions: ChallengeQuestionsEntity,
    answerStatus: AnswerStatusEnum,
    currentUserDto: CurrentUserDto,
  ): Promise<ChallengeAnswersEntity | null> {
    const { question, pairGameQuiz } = nextQuestions;

    const questionsQuizEntity = new QuestionsQuizEntity();
    questionsQuizEntity.id = question.id;
    questionsQuizEntity.questionText = question.questionText;

    const answerOwnerEntity = new UsersEntity();
    answerOwnerEntity.userId = currentUserDto.userId;

    const challengeAnswer = new ChallengeAnswersEntity();
    challengeAnswer.id = uuid4();
    challengeAnswer.answer = answer;
    challengeAnswer.answerStatus = answerStatus;
    challengeAnswer.addedAt = new Date().toISOString();
    challengeAnswer.pairGameQuiz = pairGameQuiz;
    challengeAnswer.question = questionsQuizEntity;
    challengeAnswer.answerOwner = answerOwnerEntity;

    const connection = this.challengeAnswersRepo.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use QueryBuilder to save the ChallengeAnswersEntity
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(ChallengeAnswersEntity)
        .values(challengeAnswer)
        .execute();

      // Query the current version of the associated PairsGameEntity using a subquery
      const currentVersion = await queryRunner.manager
        .createQueryBuilder()
        .select('pairGame.version', 'version')
        .select('pairGame.status', 'status')
        .from(PairsGameEntity, 'pairGame')
        .where('pairGame.id = :id', { id: pairGameQuiz.id })
        .getRawOne();

      if (currentVersion?.status !== pairGameQuiz.status) {
        // Status do not match, so roll back. Must be StatusGameEnum.ACTIVE
        await queryRunner.rollbackTransaction();
        return null; // Return null on failure
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      return challengeAnswer; // Return the saved ChallengeAnswersEntity
    } catch (error) {
      console.error('Error inserting answer into the database:', error);
      // Roll back the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getChallengeAnswersByGameId(
    pairGameQuizId: string,
  ): Promise<ChallengeAnswersEntity[]> {
    const queryBuilder = this.challengeAnswersRepo
      .createQueryBuilder('challengeAnswers')
      .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
      .leftJoinAndSelect('challengeAnswers.question', 'question')
      .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
      .where('challengeAnswers.pairGameQuizId = :pairGameQuizId', {
        pairGameQuizId,
      })
      .orderBy('challengeAnswers.addedAt', 'ASC');
    try {
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

  async saveChallengeAnswersEntities(
    entities: ChallengeAnswersEntity[],
  ): Promise<ChallengeAnswersEntity[]> {
    try {
      return await this.challengeAnswersRepo.save(entities);
    } catch (error) {
      console.error('Error while saving entities:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCountChallengeAnswersByGameIdUserId(
    pairGameQuizId: string,
    userId: string,
  ): Promise<ChallengeAnswersEntity[]> {
    const queryBuilder = this.challengeAnswersRepo
      .createQueryBuilder('challengeAnswers')
      .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
      .leftJoinAndSelect('challengeAnswers.question', 'question')
      .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
      .where('challengeAnswers.pairGameQuizId = :pairGameQuizId', {
        pairGameQuizId,
      })
      .andWhere('answerOwner.userId = :userId', {
        userId,
      })
      .orderBy('challengeAnswers.addedAt', 'ASC');
    try {
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

  async getChallengeAnswersByIds(
    pairGameQuizIds: string[],
  ): Promise<ChallengeAnswersEntity[]> {
    const queryBuilder = this.challengeAnswersRepo
      .createQueryBuilder('challengeAnswers')
      .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
      .leftJoinAndSelect('challengeAnswers.question', 'question')
      .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
      .where('challengeAnswers.pairGameQuizId IN (:...pairGameQuizIds)', {
        pairGameQuizIds,
      })
      .orderBy('challengeAnswers.addedAt', 'ASC');
    try {
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
}
