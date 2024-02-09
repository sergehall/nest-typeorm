import { IsNumber } from 'class-validator';

export class FileMetadata {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  fileSize: number;
}
