import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { PostsEntity } from './posts.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';
import { FileUploadDto } from '../../blogger-blogs/dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../../blogger-blogs/dto/url-pathKey-etag.dto';

@Entity('ImagesPostsOriginalMetadata')
export class ImagesPostsOriginalMetadataEntity {
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

  @ManyToOne(() => PostsEntity, (post) => post.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'postId', referencedColumnName: 'id' },
    { name: 'postTitle', referencedColumnName: 'title' },
  ])
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'postOwnerId', referencedColumnName: 'userId' })
  postOwner: UsersEntity;

  static createPostsImagesFileMetadataEntity(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    fileUploadDto: FileUploadDto,
    urlPathKeyEtagDto: UrlPathKeyEtagDto,
    currentUserDto: CurrentUserDto,
  ): ImagesPostsOriginalMetadataEntity {
    const { fieldname, buffer, mimetype, encoding, size, originalname } =
      fileUploadDto;

    const user = new UsersEntity();
    user.userId = currentUserDto.userId;

    const imagesPostsMetadataEntity = new ImagesPostsOriginalMetadataEntity();
    imagesPostsMetadataEntity.id = uuid4().toString();
    imagesPostsMetadataEntity.pathKey = urlPathKeyEtagDto.pathKey;
    imagesPostsMetadataEntity.eTag = urlPathKeyEtagDto.eTag;
    imagesPostsMetadataEntity.fieldName = fieldname;
    imagesPostsMetadataEntity.originalName = originalname;
    imagesPostsMetadataEntity.encoding = encoding;
    imagesPostsMetadataEntity.mimetype = mimetype;
    imagesPostsMetadataEntity.buffer = buffer;
    imagesPostsMetadataEntity.size = size;
    imagesPostsMetadataEntity.createdAt = new Date().toISOString();
    imagesPostsMetadataEntity.dependencyIsBanned = false;
    imagesPostsMetadataEntity.isBanned = false;
    imagesPostsMetadataEntity.banDate = null;
    imagesPostsMetadataEntity.banReason = null;
    imagesPostsMetadataEntity.blog = blog;
    imagesPostsMetadataEntity.post = post;
    imagesPostsMetadataEntity.postOwner = user;
    return imagesPostsMetadataEntity;
  }
}
