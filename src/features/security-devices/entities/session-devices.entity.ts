import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { PayloadDto } from '../../auth/dto/payload.dto';
import * as uuid4 from 'uuid4';
import { GuestUsersEntity } from '../../products/entities/unregistered-users.entity';

@Entity('SecurityDevices')
export class SecurityDevicesEntity {
  @PrimaryColumn('uuid', { unique: true })
  id: string;

  @Column('uuid', { nullable: false })
  deviceId: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  ip: string;

  @Column({
    type: 'character varying',
    length: 300,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  lastActiveDate: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  expirationDate: string;

  @ManyToOne(() => UsersEntity, (user) => user.securityDevices, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UsersEntity;

  @ManyToOne(
    () => GuestUsersEntity,
    (guestUsersEntity) => guestUsersEntity.securityDevices,
    {
      nullable: true,
      eager: true,
    },
  )
  @JoinColumn({ name: 'guestUserId', referencedColumnName: 'guestUserId' })
  guestUser: GuestUsersEntity | null;

  static createSecurityDevicesEntity(
    newPayload: PayloadDto,
    clientIp: string,
    userAgent: string,
  ): SecurityDevicesEntity {
    const user = new UsersEntity();
    user.userId = newPayload.userId;

    const newDevice: SecurityDevicesEntity = new SecurityDevicesEntity();
    newDevice.id = uuid4();
    newDevice.deviceId = newPayload.deviceId;
    newDevice.ip = clientIp;
    newDevice.title = userAgent;
    newDevice.lastActiveDate = new Date(newPayload.iat * 1000).toISOString();
    newDevice.expirationDate = new Date(newPayload.exp * 1000).toISOString();
    newDevice.user = user;
    newDevice.guestUser = null;

    return newDevice;
  }
}
