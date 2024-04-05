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
  Query,
} from '@nestjs/common';
import { PairGameQuizService } from '../application/pair-game-quiz.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { StartGameCommand } from '../application/use-cases/start-game.use-case';
import { MyCurrentGameCommand } from '../application/use-cases/my-current-game.use-case';
import { GameViewModel } from '../views/game.view-model';
import { GetGameByIdCommand } from '../application/use-cases/get-game-by-id.use-case';
import { AnswerDto } from '../dto/answer.dto';
import { SubmitAnswerCommand } from '../application/use-cases/submit-answer-for-current-question.use-case';
import { SkipThrottle } from '@nestjs/throttler';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { GetMyGamesCommand } from '../application/use-cases/my-games.use-case';
import { AnswerViewModel } from '../views/answer.view-model';
import { PaginatorDto } from '../../../common/helpers/paginator.dto';
import { MyGamesStatisticCommand } from '../application/use-cases/my-games-statistic.use-case';
import { GameSummaryViewModel } from '../views/game-summary.view-model';
import { GamesStatisticCommand } from '../application/use-cases/games-statistic.use-case';
import { GamesStatisticsViewModel } from '../views/games-statistics.view-model';
import { JwtAuthAndActiveGameGuard } from '../../auth/guards/jwt-auth-and-active-game.guard';
import { CurrentUserAndActiveGameDto } from '../../users/dto/current-user-and-active-game.dto';
import { PairsGameEntity } from '../entities/pairs-game.entity';
import { ApiTags } from '@nestjs/swagger';

@SkipThrottle()
@ApiTags('Pair-game-quiz')
@Controller('pair-game-quiz')
export class PairGameQuizController {
  constructor(
    private readonly pairGameQuizService: PairGameQuizService,
    private readonly parseQueriesService: ParseQueriesService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('pairs/create-questions')
  @HttpCode(HttpStatus.CREATED)
  async createAndSaveQuestion(): Promise<boolean> {
    return await this.pairGameQuizService.createAndSaveQuestion();
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my')
  async getMyGames(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetMyGamesCommand(queryData, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/my-statistic')
  async getMyStatistic(@Request() req: any): Promise<GameSummaryViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new MyGamesStatisticCommand(currentUserDto),
    );
  }

  @Get('users/top')
  async getGamesStatistic(
    @Query() query: any,
  ): Promise<GamesStatisticsViewModel[]> {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(new GamesStatisticCommand(queryData));
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my-current')
  async findUnfinishedGame(@Request() req: any): Promise<GameViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new MyCurrentGameCommand(currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('pairs/connection')
  async startGame(@Request() req: any): Promise<GameViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(new StartGameCommand(currentUserDto));
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/:id')
  async findGameById(@Request() req: any, @Param('id') id: string) {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new GetGameByIdCommand(id, currentUserDto),
    );
  }

  @UseGuards(JwtAuthAndActiveGameGuard)
  @HttpCode(HttpStatus.OK)
  @Post('pairs/my-current/answers')
  async answerToCurrentQuestion(
    @Request() req: any,
    @Body() answerDto: AnswerDto,
  ): Promise<AnswerViewModel> {
    const currentUserAndActiveGameDto: CurrentUserAndActiveGameDto = req.user;

    const currentUserDto: CurrentUserDto = {
      userId: currentUserAndActiveGameDto.userId,
      login: currentUserAndActiveGameDto.login,
      email: currentUserAndActiveGameDto.email,
      orgId: currentUserAndActiveGameDto.orgId,
      roles: currentUserAndActiveGameDto.roles,
      isBanned: currentUserAndActiveGameDto.isBanned,
    };

    const activeGame: PairsGameEntity = currentUserAndActiveGameDto.activeGame;

    return await this.commandBus.execute(
      new SubmitAnswerCommand(answerDto, activeGame, currentUserDto),
    );
  }
}
