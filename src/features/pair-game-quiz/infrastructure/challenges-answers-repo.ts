import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { Repository } from 'typeorm';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { AnswerStatusEnum } from '../enums/answer-status.enum';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
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

  async updateChallengeAnswers(
    countAnswersBoth: number,
    answer: string,
    nextQuestions: ChallengeQuestionsEntity,
    answerStatus: AnswerStatusEnum,
    currentUserDto: CurrentUserDto,
  ): Promise<ChallengeAnswersEntity> {
    const pairsGameQuizEntity = new PairsGameEntity();
    pairsGameQuizEntity.id = nextQuestions.pairGameQuiz.id;

    const questionsQuizEntity = new QuestionsQuizEntity();
    questionsQuizEntity.id = nextQuestions.question.id;
    questionsQuizEntity.questionText = nextQuestions.question.questionText;

    const answerOwnerEntity = new UsersEntity();
    answerOwnerEntity.userId = currentUserDto.userId;

    const challengeAnswer = new ChallengeAnswersEntity();
    challengeAnswer.id = uuid4();
    challengeAnswer.answer = answer;
    challengeAnswer.answerStatus = answerStatus;
    challengeAnswer.addedAt = new Date().toISOString();
    challengeAnswer.pairGameQuiz = pairsGameQuizEntity;
    challengeAnswer.question = questionsQuizEntity;
    challengeAnswer.answerOwner = answerOwnerEntity;

    try {
      return await this.challengeAnswersRepo.save(challengeAnswer);
    } catch (error) {
      console.error('Error inserting answer into the database:', error);
      throw new InternalServerErrorException(error.message);
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
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
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
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
