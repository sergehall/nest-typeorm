import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeStatusDto } from '../dto/like-status.dto';
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
        likeStatusPostEntity =
          LikeStatusPostsEntity.createLikeStatusPostsEntity(
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
}
