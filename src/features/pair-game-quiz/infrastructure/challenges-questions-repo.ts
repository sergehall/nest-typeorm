import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import * as uuid4 from 'uuid4';
import { GameQuestionsRepo } from './game-questions-repo';
import { PairsGameEntity } from '../entities/pairs-game.entity';

export class ChallengesQuestionsRepo {
  constructor(
    @InjectRepository(ChallengeQuestionsEntity)
    private readonly challengeQuestionsRepo: Repository<ChallengeQuestionsEntity>,
    protected gameQuestionsRepo: GameQuestionsRepo,
  ) {}

  async getNextChallengeQuestions(
    pairGameQuizId: string,
    countAnswers: number,
  ): Promise<ChallengeQuestionsEntity | null> {
    try {
      const offset = countAnswers;
      const limit = 1;
      const queryBuilder = this.challengeQuestionsRepo
        .createQueryBuilder('challengeQuestions')
        .leftJoinAndSelect('challengeQuestions.pairGameQuiz', 'pairGameQuiz')
        .leftJoinAndSelect('challengeQuestions.question', 'question')
        .where('pairGameQuiz.id = :pairGameQuizId', { pairGameQuizId })
        .orderBy('challengeQuestions.id', 'DESC')
        .skip(offset)
        .take(limit);

      return await queryBuilder.getOne();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Failed to retrieve Challenge Questions.' + error.message,
      );
    }
  }

  async getChallengeQuestionsByGameId(
    pairGameQuizId: string,
  ): Promise<ChallengeQuestionsEntity[]> {
    try {
      return await this.challengeQuestionsRepo
        .createQueryBuilder('challengeQuestions')
        .leftJoinAndSelect('challengeQuestions.pairGameQuiz', 'pairGameQuiz')
        .leftJoinAndSelect('challengeQuestions.question', 'question')
        .where('pairGameQuiz.id = :pairGameQuizId', { pairGameQuizId })
        .orderBy('challengeQuestions.id', 'DESC')
        .getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getChallengeQuestionsByGameIds(
    pairGameQuizIds: string[],
  ): Promise<ChallengeQuestionsEntity[]> {
    try {
      return await this.challengeQuestionsRepo
        .createQueryBuilder('challengeQuestions')
        .leftJoinAndSelect('challengeQuestions.pairGameQuiz', 'pairGameQuiz')
        .leftJoinAndSelect('challengeQuestions.question', 'question')
        .where('pairGameQuiz.id IN (:...pairGameQuizIds)', {
          pairGameQuizIds,
        })
        .orderBy('challengeQuestions.id', 'DESC')
        .getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // async createChallengeQuestions(
  //   pairGameQuizId: string,
  // ): Promise<ChallengeQuestionsEntity[]> {
  //   const numberQuestions = 5;
  //
  //   const challengeQuestions: ChallengeQuestionsEntity[] = [];
  //
  //   const questions: QuestionsQuizEntity[] =
  //     await this.gameQuestionsRepo.getRandomQuestions(numberQuestions);
  //
  //   const pairGameQuizEntity = new PairsGameQuizEntity();
  //   pairGameQuizEntity.id = pairGameQuizId;
  //
  //   // questionsIds to change the published status in the selected questions
  //   const questionsIds: string[] = [];
  //
  //   // Use map to create an array of promises for saving ChallengeQuestionsEntities
  //   const savePromises = questions.map(async (question) => {
  //     questionsIds.push(question.id);
  //     const challengeQuestion: ChallengeQuestionsEntity = {
  //       id: uuid4(), // Make sure uuid4() generates a valid UUID
  //       pairGameQuiz: pairGameQuizEntity,
  //       question: question,
  //       createdAt: new Date().toISOString(),
  //     };
  //
  //     // Save the challengeQuestion entity to the repository
  //     await this.challengeQuestionsRepo.save(challengeQuestion);
  //
  //     // Push the saved entity to the array
  //     challengeQuestions.push(challengeQuestion);
  //     return challengeQuestion; // Return the saved entity as a promise
  //   });
  //
  //   // Wait for all promises to complete
  //   await Promise.all(savePromises);
  //
  //   // await this.updatePublishedStatus(questionsIds, true);
  //
  //   // Return the array of saved ChallengeQuestionsEntities
  //   return challengeQuestions;
  // }

  async createChallengeQuestions(
    pairGameQuizId: string,
  ): Promise<ChallengeQuestionsEntity[]> {
    const numberQuestions = 5;

    const challengeQuestions: ChallengeQuestionsEntity[] = [];

    const questions: QuestionsQuizEntity[] =
      await this.gameQuestionsRepo.getRandomQuestions(numberQuestions);

    const pairGameQuizEntity = new PairsGameEntity();
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
      await this.challengeQuestionsRepo.save(challengeQuestion);

      // Push the saved entity to the array
      challengeQuestions.push(challengeQuestion);
      return challengeQuestion; // Return the saved entity as a promise
    });

    // Wait for all promises to complete
    await Promise.all(savePromises);

    // await this.updatePublishedStatus(questionsIds, true);

    // Return the array of saved ChallengeQuestionsEntities
    return challengeQuestions;
  }

  async getChallengeQuestionsByCountAnswersUser(
    pairGameQuizId: string,
    countAnswers: number,
  ): Promise<ChallengeQuestionsEntity[]> {
    try {
      return await this.challengeQuestionsRepo
        .createQueryBuilder('challengeQuestions')
        .leftJoinAndSelect('challengeQuestions.pairGameQuiz', 'pairGameQuiz')
        .leftJoinAndSelect('challengeQuestions.question', 'question')
        .where('pairGameQuiz.id = :pairGameQuizId', { pairGameQuizId })
        .orderBy('challengeQuestions.id', 'DESC')
        .take(countAnswers + 1)
        .getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
