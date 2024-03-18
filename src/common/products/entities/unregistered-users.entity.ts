import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import * as uuid4 from 'uuid4';
import { OrgIdEnums } from '../../../features/users/enums/org-id.enums';
import { SecurityDevicesEntity } from '../../../features/security-devices/entities/session-devices.entity';

@Unique(['guestUserId', 'isBanned'])
@Entity('GuestUsers')
export class GuestUsersEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  guestUserId: string;

  @Column({ nullable: false })
  createdAt: string;

  @Column({
    type: 'enum',
    enum: OrgIdEnums,
    default: OrgIdEnums.UNREGISTERED,
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

  @Column({ type: 'character varying', nullable: true, default: null })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true, default: null })
  banReason: string | null = null;

  @Column({ nullable: false })
  expirationDate: string;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(
    () => SecurityDevicesEntity,
    (securityDevice) => securityDevice.guestUser,
  )
  securityDevices: SecurityDevicesEntity[];

  events: any[] = [];

  static createUserEntity(): GuestUsersEntity {
    const user: GuestUsersEntity = new GuestUsersEntity();
    user.guestUserId = uuid4();
    user.createdAt = new Date().toISOString();
    user.orgId = OrgIdEnums.UNREGISTERED;
    user.roles = [UserRolesEnums.USER];
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;
    return user;
  }
}
