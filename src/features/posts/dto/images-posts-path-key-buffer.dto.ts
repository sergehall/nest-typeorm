import { IsNotEmpty, IsString } from 'class-validator';

export class ImagesPostsPathKeyBufferDto {
  @IsNotEmpty()
  @IsString()
  pathKey: string;
  buffer: Buffer;
}
