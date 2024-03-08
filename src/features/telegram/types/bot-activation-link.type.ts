import { IsString, IsUrl } from 'class-validator';

export class BotActivationLink {
  @IsString()
  @IsUrl()
  link: string;
}
