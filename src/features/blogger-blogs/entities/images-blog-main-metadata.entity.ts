import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BloggerBlogsEntity } from './blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FileUploadDto } from '../dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../dto/url-pathKey-etag.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';

@Entity('ImagesBlogsMainMetadata')
export class ImagesBlogsMainMetadataEntity {
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

  static createImagesBlogsMainFileMetadataEntity(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDto,
    urlKeyEtagDto: UrlPathKeyEtagDto,
    currentUserDto: CurrentUserDto,
  ): ImagesBlogsMainMetadataEntity {
    const { fieldname, buffer, mimetype, encoding, size, originalname } =
      fileUploadDto;

    const user = new UsersEntity();
    user.userId = currentUserDto.userId;
    user.login = currentUserDto.login;

    const imagesBlogsMainMetadataEntity = new ImagesBlogsMainMetadataEntity();
    imagesBlogsMainMetadataEntity.id = uuid4().toString();
    imagesBlogsMainMetadataEntity.pathKey = urlKeyEtagDto.pathKey;
    imagesBlogsMainMetadataEntity.eTag = urlKeyEtagDto.eTag;
    imagesBlogsMainMetadataEntity.fieldName = fieldname;
    imagesBlogsMainMetadataEntity.originalName = originalname;
    imagesBlogsMainMetadataEntity.encoding = encoding;
    imagesBlogsMainMetadataEntity.mimetype = mimetype;
    imagesBlogsMainMetadataEntity.buffer = buffer;
    imagesBlogsMainMetadataEntity.size = size;
    imagesBlogsMainMetadataEntity.createdAt = new Date().toISOString();
    imagesBlogsMainMetadataEntity.dependencyIsBanned = false;
    imagesBlogsMainMetadataEntity.isBanned = false;
    imagesBlogsMainMetadataEntity.banDate = null;
    imagesBlogsMainMetadataEntity.banReason = null;
    imagesBlogsMainMetadataEntity.blog = blog;
    imagesBlogsMainMetadataEntity.blogOwner = user;
    return imagesBlogsMainMetadataEntity;
  }
}
