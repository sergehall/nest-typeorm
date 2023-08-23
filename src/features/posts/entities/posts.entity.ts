import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { Users } from '../../users/entities/users.entity';

@Entity('Posts')
@Unique(['id'])
export class PostsEntity {
  @PrimaryColumn('uuid', { nullable: false, unique: true })
  id: string;

  @Column({
    type: 'varchar',
    length: 30,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 100,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  shortDescription: string;

  @Column({
    type: 'varchar',
    length: 1000,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  content: string;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id)
  @JoinColumn({ name: 'blogId' })
  blog: BloggerBlogsEntity;

  @Column({
    type: 'varchar',
    length: 15,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  blogName: string;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  createdAt: string;

  @ManyToOne(() => Users, (user) => user.userId)
  @JoinColumn({ name: 'postOwnerId' })
  postOwner: Users;

  @Column({ default: false })
  dependencyIsBanned: boolean;

  @Column({ default: false })
  banInfoIsBanned: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  banInfoBanDate: string;

  @Column({
    type: 'varchar',
    length: 300,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  banInfoBanReason: string;

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
