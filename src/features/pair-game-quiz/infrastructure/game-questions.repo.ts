import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import { EntityManager, Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { UpdatePublishDto } from '../../sa-quiz-questions/dto/update-publish.dto';
import { UpdateQuizQuestionDto } from '../../sa-quiz-questions/dto/update-quiz-question.dto';
import { CreateQuizQuestionDto } from '../../sa-quiz-questions/dto/create-quiz-question.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { QuestionsAndCountDto } from '../../sa-quiz-questions/dto/questions-and-count.dto';
import { ComplexityEnums } from '../enums/complexity.enums';
import { dictionaryQuestions } from '../questions/dictionary-questions';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import * as crypto from 'crypto';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';

export class GameQuestionsRepo {
  constructor(
    @InjectRepository(QuestionsQuizEntity)
    private readonly questionsRepository: Repository<QuestionsQuizEntity>,
    protected keyResolver: KeyResolver,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async getQuestionById(id: string): Promise<QuestionsQuizEntity | null> {
    try {
      const queryBuilder = this.questionsRepository
        .createQueryBuilder('questionsQuiz')
        .where('questionsQuiz.id = :id', {
          id,
        })
        .andWhere('questionsQuiz.published = :published', {
          published: true,
        });

      const questionsQuizEntity: QuestionsQuizEntity | null =
        await queryBuilder.getOne();

      return questionsQuizEntity ? questionsQuizEntity : null;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
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
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(`Questions with ID ${userId} not found`);
      }
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
      newQuestion.published = true;
      newQuestion.createdAt = new Date().toISOString();

      // Save the question to the database
      await this.questionsRepository.save(newQuestion);

      return newQuestion;
    } catch (error) {
      console.error('Error inserting questions into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRandomQuestions(
    numberQuestions: number,
  ): Promise<QuestionsQuizEntity[]> {
    const queryBuilderQuestions = this.questionsRepository
      .createQueryBuilder('questionsQuiz')
      .where('questionsQuiz.published = :published', { published: true })
      .orderBy('RANDOM()')
      .limit(numberQuestions);
    try {
      return await queryBuilderQuestions.getMany();
    } catch (error) {
      console.error('Error inserting questions into the database:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saGetQuestions(
    queryData: ParseQueriesDto,
  ): Promise<QuestionsAndCountDto> {
    const bodySearchTerm = queryData.bodySearchTerm;

    const { sortBy, sortDirection, pageSize, pageNumber } =
      queryData.queryPagination;

    // Retrieve paging parameters
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;
    const field: string = await this.getSortByField(sortBy);

    const collate = direction === 'ASC' ? `NULLS FIRST` : `NULLS LAST`;

    try {
      const queryBuilder = this.questionsRepository
        .createQueryBuilder('questionsQuiz')
        .where('questionsQuiz.questionText ILIKE :bodySearchTerm', {
          bodySearchTerm,
        })
        .orderBy(`questionsQuiz.${field}`, direction, collate);

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
          newQuestion.published = true;
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

  private async getSortByField(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      ['complexity', 'topic', 'published', 'body'],
      'createdAt',
    );
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
        .andWhere('questionsQuiz.published = :published', { published: true })
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
}
