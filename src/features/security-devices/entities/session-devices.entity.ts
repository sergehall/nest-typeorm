import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('SecurityDevices')
export class SecurityDevicesEntity {
  @PrimaryColumn('uuid', { unique: true })
  id: string;

  @Column('uuid', { nullable: false })
  deviceId: string;

  @Column({
    type: 'character varying',
    length: 20,
    nullable: false,
  })
  ip: string;

  @Column({
    type: 'character varying',
    length: 50,
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
  })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
