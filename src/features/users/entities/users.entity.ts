import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

@Entity()
@Unique(['userId', 'login', 'email', 'confirmationCode'])
export class Users {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ nullable: false })
  createdAt: string;

  @Column({ nullable: false })
  orgId: string;

  @Column({
    type: 'enum',
    enum: UserRolesEnums,
    array: true,
    default: [UserRolesEnums.USER],
  })
  roles: UserRolesEnums[];

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  @Column({ nullable: false })
  confirmationCode: string;

  @Column({ nullable: false })
  expirationDate: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ type: 'character varying', nullable: true })
  isConfirmedDate: string | null = null;

  @Column({ nullable: false })
  ip: string;

  @Column({ nullable: false })
  userAgent: string;

  @Column({ default: false })
  isBanned: boolean;
}
