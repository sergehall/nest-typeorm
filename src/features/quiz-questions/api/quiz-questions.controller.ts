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
} from '@nestjs/common';
import { QuizQuestionsService } from '../application/quiz-questions.service';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SaCreateQuestionsAndAnswerCommand } from '../application/use-cases/sa-create-questions-and-answer.use-case';

@Controller('sa/quiz/questions')
export class QuizQuestionsController {
  constructor(
    private readonly quizQuestionsService: QuizQuestionsService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  findAll() {
    return this.quizQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizQuestionsService.findOne(+id);
  }

  @Post()
  @UseGuards(BaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
    return this.commandBus.execute(
      new SaCreateQuestionsAndAnswerCommand(createQuizQuestionDto),
    );
  }

  @Put(':id')
  updateById(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(+id, updateQuizQuestionDto);
  }

  @Put(':id/publish')
  updatePublish(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(+id, updateQuizQuestionDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.quizQuestionsService.remove(+id);
  }
}
