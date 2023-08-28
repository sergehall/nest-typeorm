import { KeyResolver } from '../../../common/helpers/key-resolver';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsEntity } from '../entities/comments.entity';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class CommentsRepo {
  constructor(
    private readonly keyResolver: KeyResolver,
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
  ) {}

  async findCommentById(id: string): Promise<CommentsEntity | null> {
    try {
      const comment = await this.commentsRepository.findBy({ id });
      return comment[0] ? comment[0] : null;
    } catch (error) {
      if (this.isInvalidUUIDError(error)) {
        const userId = this.extractUserIdFromError(error);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private isInvalidUUIDError(error: any): boolean {
    return error.message.includes('invalid input syntax for type uuid');
  }

  private extractUserIdFromError(error: any): string | null {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }
}
