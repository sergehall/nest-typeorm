import { KeyResolver } from '../../../common/helpers/key-resolver';
import { PostsImagesFileMetadataEntity } from '../entities/posts-images-file-metadata.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { PostsEntity } from '../entities/posts.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { UrlEtagDto } from '../../blogger-blogs/dto/url-etag.dto';
import { FileUploadDtoDto } from '../../blogger-blogs/dto/file-upload.dto';

export class PostsImagesFileMetadataRepo {
  constructor(
    @InjectRepository(PostsImagesFileMetadataEntity)
    protected postsImagesFileMetadataRepository: Repository<PostsImagesFileMetadataEntity>,
    protected keyResolver: KeyResolver,
  ) {}

  async createPostsImagesFileMetadata(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    fileUploadDto: FileUploadDtoDto,
    urlEtagDto: UrlEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<PostsImagesFileMetadataEntity> {
    const postsImagesFileMetadataEntity: PostsImagesFileMetadataEntity =
      PostsImagesFileMetadataEntity.createPostsImagesFileMetadataEntity(
        blog,
        post,
        fileUploadDto,
        urlEtagDto,
        currentUserDto,
      );

    try {
      return await this.postsImagesFileMetadataRepository.save(
        postsImagesFileMetadataEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new post.',
      );
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

  private async numberLastLikes(): Promise<number> {
    return 3;
  }

  private async getSortByField(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'title',
        'shortDescription',
        'content',
        'blogName',
        'dependencyIsBanned',
        'isBanned',
        'banDate',
        'banReason',
      ],
      'createdAt',
    );
  }
}
