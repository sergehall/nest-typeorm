import { IsNotEmpty, Length, Validate } from 'class-validator';
import { CodeExistsValidator } from '../../../common/validators/code-exists.validator';

export class CodeDto {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect code length! Must be max 50 ch.',
  })
  @Validate(CodeExistsValidator)
  code: string;
}
