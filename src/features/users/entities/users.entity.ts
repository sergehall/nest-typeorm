import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';
import { SecurityDevices } from '../../security-devices/entities/session-devices.entity';

@Entity()
@Unique(['userId', 'login', 'email', 'confirmationCode'])
export class Users {
  @PrimaryColumn('uuid', { unique: true })
  userId: string;

  @Column({
    type: 'character varying',
    length: 10,
    nullable: false,
    unique: true,
  })
  login: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ nullable: false })
  createdAt: string;

  @Column({
    type: 'enum',
    enum: OrgIdEnums,
    default: OrgIdEnums.IT_INCUBATOR,
    nullable: false,
  })
  orgId: OrgIdEnums;

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

  @Column({ nullable: false, unique: true })
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

  @OneToMany(() => SecurityDevices, (securityDevice) => securityDevice.user)
  securityDevices: SecurityDevices[];
}
