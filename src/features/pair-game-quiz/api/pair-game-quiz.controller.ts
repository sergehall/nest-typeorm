import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PairGameQuizService } from '../application/pair-game-quiz.service';
import { CreatePairGameQuizDto } from '../dto/create-pair-game-quiz.dto';
import { UpdatePairGameQuizDto } from '../dto/update-pair-game-quiz.dto';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(private readonly pairGameQuizService: PairGameQuizService) {}

  @Get('create-questions')
  async createAndSaveQuestion(): Promise<boolean> {
    return await this.pairGameQuizService.createAndSaveQuestion();
  }

  @Post('my-current')
  async findUnfinishedGame(
    @Body() createPairGameQuizDto: CreatePairGameQuizDto,
  ) {
    return await this.pairGameQuizService.create(createPairGameQuizDto);
  }

  @Get(':id')
  async findGameById(@Param('id') id: string) {
    return await this.pairGameQuizService.findOne(+id);
  }

  @Post('connection')
  async startGame(
    @Param('id') id: string,
    @Body() updatePairGameQuizDto: UpdatePairGameQuizDto,
  ) {
    return await this.pairGameQuizService.update(+id, updatePairGameQuizDto);
  }

  @Post('my-current/answer')
  async sentAnswer(
    @Param('id') id: string,
    @Body() updatePairGameQuizDto: UpdatePairGameQuizDto,
  ) {
    return await this.pairGameQuizService.update(+id, updatePairGameQuizDto);
  }
}
