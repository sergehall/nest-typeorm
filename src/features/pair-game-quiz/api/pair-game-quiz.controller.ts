import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PairGameQuizService } from '../application/pair-game-quiz.service';
import { CreatePairGameQuizDto } from '../dto/create-pair-game-quiz.dto';
import { UpdatePairGameQuizDto } from '../dto/update-pair-game-quiz.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CommandBus } from '@nestjs/cqrs';
import { StartGameCommand } from '../application/use-cases/start-game.use-case';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private readonly pairGameQuizService: PairGameQuizService,
    protected commandBus: CommandBus,
  ) {}

  @Get('create-questions')
  async createAndSaveQuestion(): Promise<boolean> {
    return await this.pairGameQuizService.createAndSaveQuestion();
  }

  @UseGuards(JwtAuthGuard)
  @Post('connection')
  async startGame(@Request() req: any) {
    const currentUserDto: CurrentUserDto = req.user;
    await this.commandBus.execute(new StartGameCommand(currentUserDto));
    return '++++';
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

  @Post('my-current/answer')
  async sentAnswer(
    @Param('id') id: string,
    @Body() updatePairGameQuizDto: UpdatePairGameQuizDto,
  ) {
    return await this.pairGameQuizService.update(+id, updatePairGameQuizDto);
  }
}
