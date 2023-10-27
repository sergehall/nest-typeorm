import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { PostsEntity } from '../entities/posts.entity';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { LikesDislikesMyStatusInfoDto } from '../../comments/dto/likes-dislikes-my-status-info.dto';
import { BannedFlagsDto } from '../dto/banned-flags.dto';

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

  async getLastThreeLastLikesByPostId(
    postId: string,
    limitPerPost: number,
  ): Promise<LikeStatusPostsEntity[]> {
    try {
      return await this.likeStatusPostsRepository
        .createQueryBuilder('likeStatusPosts')
        .leftJoinAndSelect('likeStatusPosts.post', 'post')
        .leftJoinAndSelect('likeStatusPosts.ratedPostUser', 'ratedPostUser')
        .where('likeStatusPosts.postId = :postId', { postId })
        .andWhere('likeStatusPosts.likeStatus = :likeStatus', {
          likeStatus: LikeStatusEnums.LIKE,
        })
        .andWhere('likeStatusPosts.isBanned = :isBanned', { isBanned: false })
        .orderBy('likeStatusPosts.addedAt', 'DESC')
        .take(limitPerPost)
        .getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostsLikesDislikesMyStatus(
    postIds: string[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<LikesDislikesMyStatusInfoDto[]> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const isBanned = bannedFlags.isBanned;
    try {
      return this.likeStatusPostsRepository
        .createQueryBuilder('likeStatusPosts')
        .select([
          'likeStatusPosts.postId AS "id"',
          'COUNT(CASE WHEN likeStatusPosts.likeStatus = :likeStatus THEN 1 ELSE NULL END) AS "likesCount"',
          'COUNT(CASE WHEN likeStatusPosts.likeStatus = :dislikeStatus THEN 1 ELSE NULL END) AS "dislikesCount"',
          'COALESCE(MAX(CASE WHEN likeStatusPosts.ratedPostUser.userId = :userId THEN likeStatusPosts.likeStatus ELSE NULL END), \'None\') AS "myStatus"',
        ])
        .where('likeStatusPosts.postId IN (:...postIds)', {
          postIds,
        })
        .andWhere('likeStatusPosts.isBanned = :isBanned', { isBanned })
        .setParameters({
          likeStatus: LikeStatusEnums.LIKE,
          dislikeStatus: LikeStatusEnums.DISLIKE,
          userId: currentUserDto?.userId,
        })
        .groupBy('likeStatusPosts.postId')
        .getRawMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }
}
