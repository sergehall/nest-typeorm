import { IsString, Length, Validate } from 'class-validator';
import { IsArrayValidator } from '../../../common/validators/is-array.validator';

export class CreateQuizQuestionDto {
  @IsString()
  @Length(10, 500, {
    message: 'Incorrect body! Must be min 10 ch, max 500 ch.',
  })
  body: string;

  @Validate(IsArrayValidator)
  correctAnswers: string[];
}
