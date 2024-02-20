import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BloggerBlogsEntity } from './blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FileUploadDto } from '../dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../dto/url-pathKey-etag.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';

@Entity('ImagesBlogsWallpaperMetadata')
export class ImagesBlogsWallpaperMetadataEntity {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @Column({ type: 'character varying', nullable: false })
  pathKey: string;

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

  @ManyToOne(() => UsersEntity, (user) => user.bloggerBlogs, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'blogOwnerId', referencedColumnName: 'userId' },
    { name: 'blogOwnerLogin', referencedColumnName: 'login' },
  ])
  blogOwner: UsersEntity;

  static createImagesBlogWallpaperFileMetadataEntity(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDto,
    urlPathKeyEtagDto: UrlPathKeyEtagDto,
    currentUserDto: CurrentUserDto,
  ): ImagesBlogsWallpaperMetadataEntity {
    const { fieldname, buffer, mimetype, encoding, size, originalname } =
      fileUploadDto;

    const user = new UsersEntity();
    user.userId = currentUserDto.userId;
    user.login = currentUserDto.login;

    const imagesBlogsWallpaperMetadataEntity =
      new ImagesBlogsWallpaperMetadataEntity();
    imagesBlogsWallpaperMetadataEntity.id = uuid4().toString();
    imagesBlogsWallpaperMetadataEntity.pathKey = urlPathKeyEtagDto.pathKey;
    imagesBlogsWallpaperMetadataEntity.eTag = urlPathKeyEtagDto.eTag;
    imagesBlogsWallpaperMetadataEntity.fieldName = fieldname;
    imagesBlogsWallpaperMetadataEntity.originalName = originalname;
    imagesBlogsWallpaperMetadataEntity.encoding = encoding;
    imagesBlogsWallpaperMetadataEntity.mimetype = mimetype;
    imagesBlogsWallpaperMetadataEntity.buffer = buffer;
    imagesBlogsWallpaperMetadataEntity.size = size;
    imagesBlogsWallpaperMetadataEntity.createdAt = new Date().toISOString();
    imagesBlogsWallpaperMetadataEntity.dependencyIsBanned = false;
    imagesBlogsWallpaperMetadataEntity.isBanned = false;
    imagesBlogsWallpaperMetadataEntity.banDate = null;
    imagesBlogsWallpaperMetadataEntity.banReason = null;
    imagesBlogsWallpaperMetadataEntity.blog = blog;
    imagesBlogsWallpaperMetadataEntity.blogOwner = user;
    return imagesBlogsWallpaperMetadataEntity;
  }
}
