import { IsString, IsEmail } from 'class-validator';

class Context {
  @IsString()
  name: string;

  @IsString()
  fullURL: string;
}

export class ConfirmationCodeEmailOptions {
  @IsEmail()
  to: string;

  @IsEmail()
  from: string;

  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsString()
  text: string;

  @IsString()
  html: string;

  context: Context;
}
