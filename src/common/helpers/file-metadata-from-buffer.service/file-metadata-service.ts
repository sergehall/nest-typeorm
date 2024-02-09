import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sharp from 'sharp';
import { FileMetadata } from './dto/file-metadata';

@Injectable()
export class FileMetadataService {
  async extractFromBuffer(buffer: Buffer): Promise<FileMetadata> {
    try {
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const fileSize = metadata.size || 0;

      return { width, height, fileSize };
    } catch (error) {
      console.error('Error extracting file metadata:', error);
      throw new InternalServerErrorException(
        'Error extracting file metadata:' + error.message,
      );
    }
  }
}
