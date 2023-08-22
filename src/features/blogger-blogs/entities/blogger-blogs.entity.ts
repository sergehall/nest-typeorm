import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('BloggerBlogs')
export class BloggerBlogsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'varchar', length: 50, nullable: false })
  createdAt: string;

  @Column({ nullable: false, default: false })
  isMembership: boolean;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'blogOwnerId' })
  blogOwner: UsersEntity;

  @Column({ nullable: false, default: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  banInfoIsBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanDate: string;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanReason: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  websiteUrl: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  blogOwnerLogin: string;

  @OneToMany(() => CommentsEntity, (comment) => comment.id)
  @JoinColumn({ name: 'Comments' })
  comments: CommentsEntity;
  // You might have other decorators and properties here based on your use case

  // Constraints and foreign keys are generally managed in migrations
}
