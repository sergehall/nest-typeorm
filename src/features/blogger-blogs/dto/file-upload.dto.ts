import { IsDefined, IsIn, IsNumber, Max } from 'class-validator';

export class FileUploadDto {
  @IsDefined({ message: 'Fieldname is required' })
  fieldname: string;

  @IsDefined({ message: 'Originalname is required' })
  originalname: string;

  @IsDefined({ message: 'Encoding is required' })
  encoding: string;

  @IsIn(['image/png', 'image/jpg', 'image/jpeg'], {
    message: 'Invalid file extension',
  })
  mimetype: string;

  @IsDefined({ message: 'Buffer is required' })
  buffer: Buffer;

  @IsDefined({ message: 'Size is required' })
  @IsNumber({}, { message: 'Size must be a number' })
  @Max(10000 * 1024, { message: 'File size must not exceed 100KB' })
  size: number;
}
