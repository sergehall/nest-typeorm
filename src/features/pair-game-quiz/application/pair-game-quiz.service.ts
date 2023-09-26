import { Injectable } from '@nestjs/common';
import { CreatePairGameQuizDto } from '../dto/create-pair-game-quiz.dto';
import { GameQuizRepo } from '../infrastructure/game-quiz-repo';
import { AnswerDto } from '../dto/answer.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

@Injectable()
export class PairGameQuizService {
  constructor(protected gameQuizRepo: GameQuizRepo) {}
  async createAndSaveQuestion(): Promise<boolean> {
    return await this.gameQuizRepo.createAndSaveQuestion();
  }

  async create(createPairGameQuizDto: CreatePairGameQuizDto) {
    return 'This action adds a new pairGameQuiz';
  }

  async findOne(id: number) {
    return `This action returns a #${id} pairGameQuiz`;
  }

  async update(answerDto: AnswerDto, currentUserDto: CurrentUserDto) {
    return `This action updates a #${answerDto} pairGameQuiz`;
  }

  async remove(id: number) {
    return `This action removes a #${id} pairGameQuiz`;
  }
}
