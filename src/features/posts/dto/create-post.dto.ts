import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @MaxLength(30, {
    message: 'Incorrect title length! Must be max 30 ch.',
  })
  title: string;
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'Incorrect shortDescription length! Must be max 100 ch.',
  })
  shortDescription: string;
  @IsNotEmpty()
  @MaxLength(1000, {
    message: 'Incorrect content length! Must be max 1000 ch.',
  })
  content: string;
}
