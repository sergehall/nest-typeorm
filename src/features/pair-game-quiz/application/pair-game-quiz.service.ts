import { Injectable } from '@nestjs/common';
import { CreatePairGameQuizDto } from '../dto/create-pair-game-quiz.dto';
import { UpdatePairGameQuizDto } from '../dto/update-pair-game-quiz.dto';
import { GameQuizRepo } from '../infrastructure/game-quiz-repo';

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

  async update(id: number, updatePairGameQuizDto: UpdatePairGameQuizDto) {
    return `This action updates a #${id} pairGameQuiz`;
  }

  async remove(id: number) {
    return `This action removes a #${id} pairGameQuiz`;
  }
}