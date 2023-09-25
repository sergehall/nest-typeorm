import { IsString, Validate } from 'class-validator';
import { IsArrayValidator } from '../../../common/validators/is-array.validator';

export class CreateQuizQuestionDto {
  @IsString()
  body: string;

  @Validate(IsArrayValidator)
  correctAnswers: string[];
}
