import { IsBoolean, IsString } from 'class-validator';

export class QuestionsModel {
  @IsString()
  id: string;

  @IsString()
  body: string;

  @IsString({ each: true })
  correctAnswers: string[];

  @IsBoolean()
  published: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string | null = null;
}
