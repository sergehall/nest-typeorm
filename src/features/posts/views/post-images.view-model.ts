import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PostImages {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsNumber()
  width: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}

export class PostImagesViewModel {
  main: PostImages[] = []; // Set default value
}
