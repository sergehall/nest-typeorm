import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { SaBasicAuthGuard } from '../../auth/guards/sa-basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SaCreateQuestionsAndAnswerCommand } from '../application/use-cases/sa-create-questions-and-answer.use-case';
import { QuestionsViewModel } from '../views/questions.view-model';
import { SaGetQuestionsCommand } from '../application/use-cases/sa-get-questions.use-case';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { IdParams } from '../../../common/query/params/id.params';
import { SaUpdateQuestionsAndAnswerCommand } from '../application/use-cases/sa-update-questions-and-answer.use-case';
import { SaDeleteQuestionByIdCommand } from '../application/use-cases/sa-delete-question-by-id.use-case';
import { UpdatePublishDto } from '../dto/update-publish.dto';
import { SaUpdateQuestionsPublishCommand } from '../application/use-cases/sa-update-questions-publish.use-case';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Super Admin Quiz Questions')
@Controller('sa/quiz/questions')
export class SaQuizQuestionsController {
  constructor(
    protected parseQueriesService: ParseQueriesService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(SaBasicAuthGuard)
  async saGetQuestions(@Query() query: any) {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return this.commandBus.execute(new SaGetQuestionsCommand(queryData));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SaBasicAuthGuard)
  async saCreateQuestion(
    @Body() createQuizQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuestionsViewModel> {
    return this.commandBus.execute(
      new SaCreateQuestionsAndAnswerCommand(createQuizQuestionDto),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SaBasicAuthGuard)
  async saUpdateQuestionsAndAnswer(
    @Param() params: IdParams,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new SaUpdateQuestionsAndAnswerCommand(params.id, updateQuizQuestionDto),
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SaBasicAuthGuard)
  async updatePublish(
    @Param() params: IdParams,
    @Body() updatePublishDto: UpdatePublishDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new SaUpdateQuestionsPublishCommand(params.id, updatePublishDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SaBasicAuthGuard)
  async deleteById(@Param() params: IdParams): Promise<boolean> {
    return await this.commandBus.execute(
      new SaDeleteQuestionByIdCommand(params.id),
    );
  }
}
