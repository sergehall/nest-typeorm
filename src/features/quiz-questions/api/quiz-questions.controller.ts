import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuizQuestionsService } from '../application/quiz-questions.service';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { CreateBlogsDto } from '../../blogger-blogs/dto/create-blogs.dto';
import { CommandBus } from '@nestjs/cqrs';

@Controller('sa/quiz-questions')
export class QuizQuestionsController {
  constructor(
    private readonly quizQuestionsService: QuizQuestionsService,
    private commandBus: CommandBus,
  ) {}

  @Post('quiz/questions')
  @UseGuards(BaseAuthGuard)
  async saCreateQuestions(
    @Request() req: any,
    @Body() createBlogsDto: CreateBlogsDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;

    return true;
    // return await this.commandBus.execute(
    //   new SaCreateBlogCommand(createBlogsDto, currentUserDto),
    // );
  }
  @Get()
  findAll() {
    console.log('++++');
    return this.quizQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizQuestionsService.findOne(+id);
  }

  @Post()
  create(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
    return this.quizQuestionsService.create(createQuizQuestionDto);
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
