import { IsNotEmpty, Length, Matches, Validate } from 'class-validator';
import { LoginEmailExistsValidator } from '../../../common/validators/login-email-exists.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'my-login',
    maxLength: 10,
    minLength: 3,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  @Validate(LoginEmailExistsValidator)
  login: string;
  @ApiProperty({
    type: String,
    example: 'password123',
    maxLength: 20,
    minLength: 6,
  })
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect login length! Must be min 6, max 20 ch.',
  })
  password: string;
  @ApiProperty({
    type: String,
    example: 'example@email.com',
    pattern: '^[w-.]+@([w-]+.)+[w-]{2,4}$',
  })
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @Validate(LoginEmailExistsValidator)
  email: string;
}
