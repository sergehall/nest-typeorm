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
import { PostsEntity } from '../../posts/entities/posts.entity';

export class LikeStatusCommentsRepo {
  constructor(
    @InjectRepository(LikeStatusCommentsEntity)
    private readonly likeStatusCommentRepository: Repository<LikeStatusCommentsEntity>,
  ) {}

  async updateLikeStatusComment(
    comment: CommentsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): Promise<LikeStatusCommentsEntity> {
    try {
      let likeStatusCommentEntity: LikeStatusCommentsEntity | null =
        await this.likeStatusCommentRepository.findOne({
          where: {
            comment: { id: comment.id },
            ratedCommentUser: { userId: currentUserDto.userId },
          },
        });

      if (likeStatusCommentEntity) {
        likeStatusCommentEntity.likeStatus = likeStatusDto.likeStatus;
        likeStatusCommentEntity.addedAt = new Date().toISOString();
      } else {
        likeStatusCommentEntity = await this.createLikeStatusCommentsEntity(
          comment,
          likeStatusDto,
          currentUserDto,
        );
      }

      return await this.likeStatusCommentRepository.save(
        likeStatusCommentEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createLikeStatusCommentsEntity(
    findComment: CommentsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): Promise<LikeStatusCommentsEntity> {
    const blogEntity = new BloggerBlogsEntity();
    blogEntity.id = findComment.blog.id;

    const postEntity = new PostsEntity();
    postEntity.id = findComment.post.id;

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
      addedAt: new Date().toISOString(),
      isBanned: false,
      comment: commentEntity,
      ratedCommentUser: ratedUserEntity,
      blog: blogEntity,
      post: postEntity,
      commentOwner: ownerUserEntity,
    };
  }
}
