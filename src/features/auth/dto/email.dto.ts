import { IsNotEmpty, Matches, Validate } from 'class-validator';
import { EmailAndLoginNotExistValidator } from '../../../common/validators/email-and-login-not-exist.validator';

export class EmailDto {
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @Validate(EmailAndLoginNotExistValidator)
  email: string;
}
