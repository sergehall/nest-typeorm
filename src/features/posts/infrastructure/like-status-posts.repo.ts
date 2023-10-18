import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeStatusDto } from '../dto/like-status.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import * as uuid4 from 'uuid4';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { PostsEntity } from '../entities/posts.entity';

export class LikeStatusPostsRepo {
  constructor(
    @InjectRepository(LikeStatusPostsEntity)
    private readonly likeStatusPostsRepository: Repository<LikeStatusPostsEntity>,
  ) {}
  async updateOrCreateLikeStatusPosts(
    post: PostsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): Promise<LikeStatusPostsEntity> {
    try {
      let likeStatusPostEntity: LikeStatusPostsEntity | null =
        await this.likeStatusPostsRepository.findOne({
          where: {
            post: { id: post.id },
            ratedPostUser: { userId: currentUserDto.userId },
          },
        });

      if (likeStatusPostEntity) {
        likeStatusPostEntity.likeStatus = likeStatusDto.likeStatus;
        likeStatusPostEntity.addedAt = new Date().toISOString();
      } else {
        likeStatusPostEntity = await this.likeStatusPostsEntity(
          post,
          likeStatusDto,
          currentUserDto,
        );
      }

      return await this.likeStatusPostsRepository.save(likeStatusPostEntity);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async likeStatusPostsEntity(
    post: PostsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): Promise<LikeStatusPostsEntity> {
    const blogEntity = new BloggerBlogsEntity();
    blogEntity.id = post.blog.id;

    const postOwnerEntity = new UsersEntity();
    postOwnerEntity.userId = post.postOwner.userId;

    const ratedPostUserEntity = new UsersEntity();
    ratedPostUserEntity.userId = currentUserDto.userId;
    ratedPostUserEntity.login = currentUserDto.login;
    ratedPostUserEntity.isBanned = currentUserDto.isBanned;

    return {
      id: uuid4().toString(),
      likeStatus: likeStatusDto.likeStatus,
      addedAt: new Date().toISOString(),
      isBanned: false,
      blog: blogEntity,
      post: post,
      postOwner: postOwnerEntity,
      ratedPostUser: ratedPostUserEntity,
    };
  }
}
