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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quizQuestionsService.findOne(+id);
  }

  @Post()
  @UseGuards(BaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createQuizQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuestionsModel> {
    return this.commandBus.execute(
      new SaCreateQuestionsAndAnswerCommand(createQuizQuestionDto),
    );
  }

  @Put(':id')
  async updateById(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(+id, updateQuizQuestionDto);
  }

  @Put(':id/publish')
  async updatePublish(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(+id, updateQuizQuestionDto);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.quizQuestionsService.remove(+id);
  }
}
