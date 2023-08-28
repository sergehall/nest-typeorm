import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeStatusCommentsEntity } from '../entities/like-status-comments.entity';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CommentsEntity } from '../entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import * as uuid4 from 'uuid4';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { InternalServerErrorException } from '@nestjs/common';

export class LikeStatusCommentsRepo {
  constructor(
    @InjectRepository(LikeStatusCommentsEntity)
    private readonly likeStatusCommentRepository: Repository<LikeStatusCommentsEntity>,
  ) {}
  async updateLikeStatusComment(
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
    findComment: CommentsEntity,
  ): Promise<LikeStatusCommentsEntity> {
    try {
      const LikeStatusCommentsEntity =
        await this.createLikeStatusCommentsEntity(
          likeStatusDto,
          currentUserDto,
          findComment,
        );
      return await this.likeStatusCommentRepository.save(
        LikeStatusCommentsEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createLikeStatusCommentsEntity(
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
    findComment: CommentsEntity,
  ): Promise<LikeStatusCommentsEntity> {
    const blogEntity = new BloggerBlogsEntity();
    blogEntity.id = findComment.blog.id;

    const ownerUserEntity = new UsersEntity();
    ownerUserEntity.userId = findComment.commentator.userId;

    const ratedUserEntity = new UsersEntity();
    ratedUserEntity.userId = currentUserDto.userId;
    ratedUserEntity.login = currentUserDto.login;
    ratedUserEntity.isBanned = currentUserDto.isBanned;

    const commentEntity = new CommentsEntity();
    commentEntity.id = findComment.id;

    return {
      id: uuid4().toString(),
      likeStatus: likeStatusDto.likeStatus,
      createdAt: new Date().toISOString(),
      comment: commentEntity,
      ratedCommentUser: ratedUserEntity,
      blog: blogEntity,
      commentOwner: ownerUserEntity,
    };
  }
}
