import { KeyResolver } from '../../../common/helpers/key-resolver';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { CommentsEntity } from '../entities/comments.entity';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PartialTablesCommentsEntity } from '../entities/partialTablesComments.entity';
import {
  LikesInfo,
  ReturnCommentsEntity,
} from '../entities/return-comments.entity';

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

  async createComments(
    post: PostsEntity,
    createCommentDto: CreateCommentDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ReturnCommentsEntity> {
    const commentsEntity: CommentsEntity = await this.creatCommentEntity(
      post,
      createCommentDto,
      currentUserDto,
    );

    try {
      const queryBuilder = this.commentsRepository
        .createQueryBuilder()
        .insert()
        .into(CommentsEntity)
        .values(commentsEntity)
        .returning(
          `"id", "content", "createdAt", "commentatorInfoUserId", "commentatorInfoUserLogin"`,
        );

      const result: InsertResult = await queryBuilder.execute();

      return await this.addLikesInfoAndTransformedComment(result.raw[0]);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new comment.',
      );
    }
  }

  private isInvalidUUIDError(error: any): boolean {
    return error.message.includes('invalid input syntax for type uuid');
  }

  private extractUserIdFromError(error: any): string | null {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }

  private async creatCommentEntity(
    post: PostsEntity,
    createCommentDto: CreateCommentDto,
    currentUserDto: CurrentUserDto,
  ): Promise<CommentsEntity> {
    const { content } = createCommentDto;

    const commentator = new UsersEntity();
    commentator.userId = currentUserDto.userId;
    commentator.login = currentUserDto.login;

    const blogOwner = new UsersEntity();
    blogOwner.userId = post.postOwner.userId;

    const blog = new BloggerBlogsEntity();
    blog.id = post.blog.id;
    blog.name = post.blog.name;

    const commentsEntity = new CommentsEntity();
    commentsEntity.id = uuid4().toString();
    commentsEntity.content = content;
    commentsEntity.createdAt = new Date().toISOString();
    commentsEntity.banInfoIsBanned = false;
    commentsEntity.banInfoBanDate = null;
    commentsEntity.banInfoBanReason = null;
    commentsEntity.dependencyIsBanned = false;
    commentsEntity.isBanned = false;
    commentsEntity.blog = blog;
    commentsEntity.blogOwner = blogOwner;
    commentsEntity.post = post;
    commentsEntity.commentator = commentator;

    return commentsEntity;
  }

  private async addLikesInfoAndTransformedComment(
    comment: PartialTablesCommentsEntity,
  ): Promise<ReturnCommentsEntity> {
    const commentatorInfo = {
      userId: comment.commentatorInfoUserId,
      userLogin: comment.commentatorInfoUserLogin,
    };
    const likesInfo = new LikesInfo();
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo,
      likesInfo,
    };
  }
}
