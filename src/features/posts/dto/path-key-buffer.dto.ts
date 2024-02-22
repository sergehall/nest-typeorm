import { IsNotEmpty, IsString } from 'class-validator';

export class PathKeyBufferDto {
  @IsNotEmpty()
  @IsString()
  pathKey: string;
  buffer: Buffer;
}

// const pathKeyBuffer = {
//   pathKey: imageBlogMainMetadataEntity.pathKey,
//   buffer: imageBlogMainMetadataEntity.buffer,
// };
