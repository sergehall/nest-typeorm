import { IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewModel {
  @ApiProperty({
    type: String,
    example: 'f0f56ed1-a02d-40c6-a7e8-ea5b0f0008fd',
    description: 'id',
  })
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 100 ch.',
  })
  id: string;
  @ApiProperty({ type: String, example: 'my-login', description: 'User login' })
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @ApiProperty({
    type: String,
    example: 'my-email@gmail.com',
    description: 'User email',
  })
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @ApiProperty({
    type: String,
    example: '2024-04-05T07:31:32.342Z',
    description: 'User creation date',
  })
  @IsNotEmpty()
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
}
