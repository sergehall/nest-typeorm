import { Injectable } from '@nestjs/common';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';

@Injectable()
export class QuizQuestionsService {
  create(createQuizQuestionDto: CreateQuizQuestionDto) {
    return 'This action adds a new quizQuestion';
  }

  findAll() {
    return `This action returns all quizQuestions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quizQuestion`;
  }

  update(id: number, updateQuizQuestionDto: UpdateQuizQuestionDto) {
    return `This action updates a #${id} quizQuestion`;
  }

  remove(id: number) {
    return `This action removes a #${id} quizQuestion`;
  }
}
