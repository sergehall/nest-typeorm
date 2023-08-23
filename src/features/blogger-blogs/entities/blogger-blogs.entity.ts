import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('BloggerBlogs')
@Unique(['id'])
export class BloggerBlogsEntity {
  @PrimaryColumn('uuid', { unique: true })
  id: string;

  @CreateDateColumn({ type: 'varchar', length: 50, nullable: false })
  createdAt: string;

  @Column({ nullable: false, default: false })
  isMembership: boolean;

  @Column({ nullable: false, default: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  banInfoIsBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanReason: string | null = null;

  @Column({ type: 'character varying', length: 15, nullable: false })
  name: string;

  @Column({ type: 'character varying', length: 500, nullable: false })
  description: string;

  @Column({ type: 'character varying', length: 100, nullable: false })
  websiteUrl: string;

  @Column({ type: 'character varying', length: 20, nullable: false })
  blogOwnerLogin: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'blogOwnerId' })
  blogOwnerId: UsersEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.id)
  @JoinColumn({ name: 'Comments' })
  comments: CommentsEntity[];
}
