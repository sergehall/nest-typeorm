import { IsNotEmpty, Length, Matches, Validate } from 'class-validator';
import { LoginEmailExistsValidator } from '../../../common/validators/login-email-exists.validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  @Validate(LoginEmailExistsValidator)
  login: string;
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect login length! Must be min 6, max 20 ch.',
  })
  password: string;
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @Validate(LoginEmailExistsValidator)
  email: string;
}
