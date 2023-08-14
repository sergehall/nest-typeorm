import { IsNotEmpty, Matches, Validate } from 'class-validator';
import { EmailNotExistValidator } from '../../../common/validators/email-not-exist.validator';

export class EmailDto {
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @Validate(EmailNotExistValidator)
  email: string;
}
