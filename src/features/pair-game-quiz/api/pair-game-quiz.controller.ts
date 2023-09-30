import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PairGameQuizService } from '../application/pair-game-quiz.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CommandBus } from '@nestjs/cqrs';
import { StartGameCommand } from '../application/use-cases/start-game.use-case';
import { MyCurrentGameCommand } from '../application/use-cases/my-current-game.use-case';
import { GameViewModel } from '../models/game.view-model';
import { GetGameByIdCommand } from '../application/use-cases/get-game-by-id.use-case';
import { AnswerDto } from '../dto/answer.dto';
import { AnswerToCurrentQuestionCommand } from '../application/use-cases/answer-for-current-question.use-case';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private readonly pairGameQuizService: PairGameQuizService,
    protected commandBus: CommandBus,
  ) {}

  @Get('create-questions')
  @HttpCode(HttpStatus.CREATED)
  async createAndSaveQuestion(): Promise<boolean> {
    return await this.pairGameQuizService.createAndSaveQuestion();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-current')
  async findUnfinishedGame(@Request() req: any): Promise<GameViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new MyCurrentGameCommand(currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('connection')
  async startGame(@Request() req: any): Promise<GameViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(new StartGameCommand(currentUserDto));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findGameById(@Request() req: any, @Param('id') id: string) {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new GetGameByIdCommand(id, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-current/answers')
  async answerToCurrentQuestion(
    @Request() req: any,
    @Body() answerDto: AnswerDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new AnswerToCurrentQuestionCommand(answerDto, currentUserDto),
    );
  }
}
