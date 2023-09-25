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
import { QuizQuestionsService } from '../application/quiz-questions.service';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SaCreateQuestionsAndAnswerCommand } from '../application/use-cases/sa-create-questions-and-answer.use-case';
import { QuestionsModel } from '../models/questions.model';
import { SaGetQuestionsCommand } from '../application/use-cases/sa-get-questions.use-case';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { IdParams } from '../../../common/query/params/id.params';
import { SaUpdateQuestionsAndAnswerCommand } from '../application/use-cases/sa-update-questions-and-answer.use-case';
import { SaDeleteQuestionByIdCommand } from '../application/use-cases/sa-delete-question-by-id.use-case';

@Controller('sa/quiz/questions')
export class QuizQuestionsController {
  constructor(
    private readonly quizQuestionsService: QuizQuestionsService,
    protected parseQueriesService: ParseQueriesService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(BaseAuthGuard)
  async getQuestions(@Query() query: any) {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);
    return this.commandBus.execute(new SaGetQuestionsCommand(queryData));
  }

  @Post()
  @UseGuards(BaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async saCreateQuestion(
    @Body() createQuizQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuestionsModel> {
    return this.commandBus.execute(
      new SaCreateQuestionsAndAnswerCommand(createQuizQuestionDto),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saUpdateQuestions(
    @Param() params: IdParams,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new SaUpdateQuestionsAndAnswerCommand(params.id, updateQuizQuestionDto),
    );
  }

  @Put(':id/publish')
  async updatePublish(
    @Param() params: IdParams,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(+params.id, updateQuizQuestionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param() params: IdParams): Promise<boolean> {
    return await this.commandBus.execute(
      new SaDeleteQuestionByIdCommand(params.id),
    );
  }
}
