import { IsNotEmpty, Length, Matches, Validate } from 'class-validator';
import { VerifyUserLoginEmailExistenceRule } from '../../../common/validators/verify-user-login-email-existence.rule';

export class LoginDto {
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  @Validate(VerifyUserLoginEmailExistenceRule)
  login: string;
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect shortDescription length! Must be min 6,max 20 ch.',
  })
  password: string;
  @IsNotEmpty({ message: 'Email should not be empty' })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @Validate(VerifyUserLoginEmailExistenceRule)
  email: string;
}
