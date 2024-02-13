import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BloggerBlogsEntity } from './blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FileUploadDtoDto } from '../dto/file-upload.dto';
import { UrlEtagDto } from '../dto/url-etag.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { ImagesPostMetadataEntity } from '../../posts/entities/images-post-metadata.entity';
import * as uuid4 from 'uuid4';

@Entity('ImagesBlogWallpaperMetadata')
export class ImagesBlogWallpaperMetadataEntity {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @Column({ type: 'character varying', nullable: false })
  url: string;

  @Column({ type: 'character varying', nullable: false })
  eTag: string;

  @Column({ type: 'character varying', nullable: false })
  fieldName: string;

  @Column({ type: 'character varying', nullable: false })
  originalName: string;

  @Column({ type: 'character varying', nullable: false })
  encoding: string;

  @Column({ type: 'character varying', nullable: false })
  mimetype: string;

  @Column({ type: 'bytea', nullable: false }) // Assuming 'bytea' is used for storing binary data in your database
  buffer: Buffer;

  @Column({ type: 'int', nullable: false })
  size: number;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  createdAt: string;

  @Column({ default: false, nullable: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.posts, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'blogId', referencedColumnName: 'id' },
    { name: 'blogName', referencedColumnName: 'name' },
  ])
  blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'blogOwnerId', referencedColumnName: 'userId' })
  postOwner: UsersEntity;

  static createImagesBlogWallpaperFileMetadataEntity(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDtoDto,
    urlEtagDto: UrlEtagDto,
    currentUserDto: CurrentUserDto,
  ): ImagesBlogWallpaperMetadataEntity {
    const { fieldname, buffer, mimetype, encoding, size, originalname } =
      fileUploadDto;

    const user = new UsersEntity();
    user.userId = currentUserDto.userId;

    const postsImagesFileMetadataEntity = new ImagesPostMetadataEntity();
    postsImagesFileMetadataEntity.id = uuid4().toString();
    postsImagesFileMetadataEntity.url = urlEtagDto.url;
    postsImagesFileMetadataEntity.eTag = urlEtagDto.eTag;
    postsImagesFileMetadataEntity.fieldName = fieldname;
    postsImagesFileMetadataEntity.originalName = originalname;
    postsImagesFileMetadataEntity.encoding = encoding;
    postsImagesFileMetadataEntity.mimetype = mimetype;
    postsImagesFileMetadataEntity.buffer = buffer;
    postsImagesFileMetadataEntity.size = size;
    postsImagesFileMetadataEntity.createdAt = new Date().toISOString();
    postsImagesFileMetadataEntity.dependencyIsBanned = false;
    postsImagesFileMetadataEntity.isBanned = false;
    postsImagesFileMetadataEntity.banDate = null;
    postsImagesFileMetadataEntity.banReason = null;
    postsImagesFileMetadataEntity.blog = blog;
    postsImagesFileMetadataEntity.postOwner = user;
    return postsImagesFileMetadataEntity;
  }
}
