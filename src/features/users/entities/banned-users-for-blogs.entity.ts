import { Entity, Column, Unique, PrimaryColumn } from 'typeorm';

@Entity('banned_users_for_blogs')
@Unique(['blogId', 'userId', 'isBanned'])
export class BannedUsersForBlogsEntity {
  @PrimaryColumn({ nullable: false })
  id: number;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  // @ManyToOne(() => BlogEntity, (blog) => blog.bannedUsers)
  // @JoinColumn({ name: 'blogId' })
  // blog: BlogEntity;
  //
  // @ManyToOne(() => Users, (user) => user.bannedBlogs)
  // @JoinColumn({ name: 'userId' })
  // user: Users;

  @Column({ nullable: false })
  blogId: string;

  @Column({ nullable: false })
  userId: string;
}
