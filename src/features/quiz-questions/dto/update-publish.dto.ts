import { IsBoolean } from 'class-validator';

export class UpdatePublishDto {
  @IsBoolean()
  published: boolean;
}
