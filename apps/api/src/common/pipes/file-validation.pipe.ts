import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  fileNotProvided,
  fileSizeLimit,
  invalidFileExtension,
} from '../filters/custom-errors-messages';
import sharp from 'sharp';
import { FileUploadDto } from '../../features/blogger-blogs/dto/file-upload.dto';
import { CustomErrorsMessagesType } from '../filters/types/custom-errors-messages.types';
import { FileConstraintsDto } from './file-constraints/file-constraints.dto';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly constraintsKey: FileConstraintsDto) {}

  async transform(
    value: Express.Multer.File | undefined,
    _metadata: ArgumentMetadata,
  ): Promise<FileUploadDto> {
    const constraints: FileConstraintsDto = this.constraintsKey;

    if (!constraints) {
      throw new HttpException(
        { message: 'Constraints not found for the specified key' },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.checkFileNotProvided(value);
    const file = value;
    const errorMessage: CustomErrorsMessagesType[] = [];

    await Promise.all([
      this.checkFileSize(file, constraints, errorMessage),
      this.checkFileExtension(file, constraints, errorMessage),
      this.checkImageDimensions(file, constraints, errorMessage),
    ]);

    if (errorMessage.length > 0) {
      throw new HttpException({ message: errorMessage }, HttpStatus.BAD_REQUEST);
    }

    return file;
  }

  private checkFileNotProvided(
    value: Express.Multer.File | undefined,
  ): asserts value is Express.Multer.File {
    if (!value) {
      throw new HttpException({ message: fileNotProvided }, HttpStatus.BAD_REQUEST);
    }
  }

  private checkFileSize(
    value: Express.Multer.File,
    constraints: FileConstraintsDto,
    errorMessage: CustomErrorsMessagesType[],
  ): void {
    if (value.size > constraints.maxSize) {
      errorMessage.push(fileSizeLimit);
    }
  }

  private checkFileExtension(
    value: Express.Multer.File,
    constraints: FileConstraintsDto,
    errorMessage: CustomErrorsMessagesType[],
  ): void {
    const fileExtension = this.getFileExtension(value.mimetype);
    if (!constraints.allowedExtensions.some((extension) => extension === fileExtension)) {
      errorMessage.push(invalidFileExtension);
    }
  }

  private getFileExtension(mimetype: string): string {
    const parts = mimetype.split('/');
    return parts.length === 2 ? '.' + parts[1] : '';
  }

  private async checkImageDimensions(
    value: Express.Multer.File,
    constraints: FileConstraintsDto,
    errorMessage: CustomErrorsMessagesType[],
  ): Promise<void> {
    try {
      const metadata = await sharp(value.buffer).metadata();
      const expectedFormats = constraints.allowedExtensions.map((extension) =>
        extension.slice(1).replace('jpg', 'jpeg'),
      );
      if (
        !metadata.format ||
        !expectedFormats.includes(metadata.format) ||
        !metadata.width ||
        metadata.width !== constraints.width ||
        !metadata.height ||
        metadata.height !== constraints.height
      ) {
        errorMessage.push({
          message: `Invalid dimensions: width should be within ${constraints.width} and height within ${constraints.height}.`,
          file: 'file.dimensions',
        });
      }
    } catch {
      throw new HttpException({ message: 'Error reading image metadata' }, HttpStatus.BAD_REQUEST);
    }
  }
}
