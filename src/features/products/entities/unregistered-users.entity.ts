import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import * as uuid4 from 'uuid4';
import { SecurityDevicesEntity } from '../../security-devices/entities/session-devices.entity';

@Unique(['guestUserId', 'isBanned'])
@Entity('GuestUsers')
export class GuestUsersEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  guestUserId: string;

  @Column({ nullable: false })
  createdAt: string;

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

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(
    () => SecurityDevicesEntity,
    (securityDevice) => securityDevice.guestUser,
  )
  securityDevices: SecurityDevicesEntity[];

  events: any[] = [];

  static createGuestUsersEntity(): GuestUsersEntity {
    const user: GuestUsersEntity = new GuestUsersEntity();
    user.guestUserId = uuid4();
    user.createdAt = new Date().toISOString();
    user.roles = [UserRolesEnums.UNREGISTERED];
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;
    return user;
  }
}
