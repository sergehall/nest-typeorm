import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplexityEnums } from '../enums/complexity.enums';
import { InternalServerErrorException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../entities/questions-quiz.entity';
import * as crypto from 'crypto';
import { DifficultyDictionary } from '../questions/types/difficulty-dictionary.type';
import { StatusGameEnum } from '../enums/status-game.enum';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { PairQuestionsDto } from '../dto/pair-questions.dto';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';

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
  ) {}

  async isExistPair(userId: string): Promise<PairsGameQuizEntity | null> {
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

  async getOrCreatePairGame(
    currentUserDto: CurrentUserDto,
  ): Promise<PairQuestionsDto> {
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

        return { pair: createdGame, challengeQuestions };
      }

      createdGame = await this.addSecondPlayerAndStarGame(
        pendingGame,
        currentUserDto,
      );

      let challengeQuestions: ChallengeQuestionsEntity[] = [];

      let countAnswers = 0;

      if (createdGame.secondPlayer) {
        countAnswers = await this.getCountAnswers(
          pendingGame.id,
          currentUserDto.userId,
        );
        challengeQuestions = await this.getChallengeQuestions(
          pendingGame.id,
          countAnswers,
        );
      }
      return { pair: createdGame, challengeQuestions };

      // const pairGameQuizId = pendingGame.id;
      // let pairGameQuiz = pendingGame;
      //
      // if (pairGameQuiz) {
      //   // add Second Player and start game
      //   pairGameQuiz = await this.addSecondPlayerAndStarGame(
      //     pairGameQuiz,
      //     currentUserDto,
      //   );
      // }
      //
      // let challengeQuestions: ChallengeQuestionsEntity[] = [];
      //
      // let countAnswers = 0;
      //
      // if (pairGameQuiz.secondPlayer) {
      //   countAnswers = await this.getCountAnswers(
      //     pairGameQuizId,
      //     currentUserDto.userId,
      //   );
      //   challengeQuestions = await this.getChallengeQuestions(
      //     pairGameQuizId,
      //     countAnswers,
      //   );
      // }
      // return { pair: pairGameQuiz, challengeQuestions };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getCountAnswers(id: string, userId: string): Promise<number> {
    const queryBuilder = this.challengeAnswersRepository
      .createQueryBuilder('challengeAnswers')
      .leftJoinAndSelect('challengeAnswers.pairGameQuiz', 'pairGameQuiz')
      .leftJoinAndSelect('challengeAnswers.question', 'question')
      .leftJoinAndSelect('challengeAnswers.answerOwner', 'answerOwner')
      .where('challengeAnswers.pairGameQuizId = :id', { id })
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

    // Use map to create an array of promises for saving ChallengeQuestionsEntities
    const savePromises = questions.map(async (question) => {
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

    // Return the array of saved ChallengeQuestionsEntities
    return challengeQuestions;
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
        .createQueryBuilder('question')
        .where('question.complexity = :complexity', { complexity })
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

  private async hashAnswer(answer: string, length: number): Promise<string> {
    const fullHash = crypto.createHash('sha256').update(answer).digest('hex');
    return fullHash.substring(0, length);
  }

  async createAndSaveQuestion(): Promise<boolean> {
    // Example of created questions
    const dictionaryQuestions: DifficultyDictionary = {
      easy: [
        {
          id: '1',
          question: 'What is RAM?',
          answer: 'Memory',
          topic: 'Computer science',
          complexity: ComplexityEnums.EASY,
        },
      ],
      medium: [
        {
          id: '1',
          question: 'Explain OOP.',
          answer: 'Object-Oriented Programming',
          topic: 'Computer science',
          complexity: ComplexityEnums.MEDIUM,
        },
      ],
      difficult: [
        {
          id: '1',
          question: 'Explain quantum computing.',
          answer: 'Quantum Bits',
          topic: 'Computer science',
          complexity: ComplexityEnums.DIFFICULT,
        },
      ],
    };

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
          const newQuestion = new QuestionsQuizEntity();
          newQuestion.questionText = question.question;
          newQuestion.hashAnswer = await this.hashAnswer(question.answer, 20);
          newQuestion.complexity = question.complexity;
          newQuestion.topic = question.topic;

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
}
