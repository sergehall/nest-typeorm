import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplexityEnums } from '../enums/complexity.enums';
import { InternalServerErrorException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../entities/questions-quiz.entity';
import * as crypto from 'crypto';
import { DifficultyDictionary } from '../questions/types/difficulty-dictionary.type';

export class PairGameQuizRepo {
  constructor(
    @InjectRepository(QuestionsQuizEntity)
    private readonly questionsRepository: Repository<QuestionsQuizEntity>,
  ) {}

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

  private async hashAnswer(answer: string, length: number): Promise<string> {
    const fullHash = crypto.createHash('sha256').update(answer).digest('hex');
    return fullHash.substring(0, length);
  }
}
