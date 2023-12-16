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
  invalidImageDimensions,
} from '../filters/custom-errors-messages';
import * as sharp from 'sharp';
import { FileDto } from '../../features/blogger-blogs/dto/file-upload.dto';
import { CustomErrorsMessagesType } from '../filters/types/custom-errors-messages.types';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<FileDto> {
    // allowed are '.png', '.jpg', '.jpeg'
    const constraints = {
      maxSize: 100 * 1024, // 100KB
      allowedExtensions: ['.png', '.jpg', '.jpeg'],
      maxWidth: 940,
      maxHeight: 432,
    };

    const errorMessage: CustomErrorsMessagesType[] = [];

    await this.checkFileNotProvided(value, errorMessage);
    await this.checkFileSize(value, constraints, errorMessage);
    await this.checkFileExtension(value, constraints, errorMessage);
    await this.checkImageDimensions(value, constraints, errorMessage);

    if (errorMessage.length > 0) {
      throw new HttpException(
        { message: errorMessage },
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }

  private async checkFileNotProvided(
    value: any,
    errorMessage: CustomErrorsMessagesType[],
  ): Promise<void> {
    if (!value) {
      errorMessage.push(fileNotProvided);
    }
  }

  private async checkFileSize(
    value: any,
    constraints: any,
    errorMessage: CustomErrorsMessagesType[],
  ): Promise<void> {
    if (value.size > constraints.maxSize) {
      errorMessage.push(fileSizeLimit);
    }
  }

  private async checkFileExtension(
    value: any,
    constraints: any,
    errorMessage: CustomErrorsMessagesType[],
  ): Promise<void> {
    const fileExtension = this.getFileExtension(value.mimetype);
    if (!constraints.allowedExtensions.includes(fileExtension)) {
      errorMessage.push(invalidFileExtension);
    }
  }

  private getFileExtension(mimetype: string): string {
    const parts = mimetype.split('/');
    return parts.length === 2 ? '.' + parts[1] : '';
  }

  private async checkImageDimensions(
    value: any,
    constraints: any,
    errorMessage: CustomErrorsMessagesType[],
  ): Promise<void> {
    try {
      const metadata = await sharp(value.buffer).metadata();
      if (
        !metadata.width ||
        metadata.width > constraints.maxWidth ||
        !metadata.height ||
        metadata.height > constraints.maxHeight
      ) {
        errorMessage.push(invalidImageDimensions);
      }
    } catch (error) {
      throw new HttpException(
        { message: 'Error reading image metadata' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
