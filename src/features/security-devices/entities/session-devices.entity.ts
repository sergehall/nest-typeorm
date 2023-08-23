import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Users } from '../../users/entities/users.entity';

@Entity('SecurityDevices')
export class SecurityDevices {
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

  @ManyToOne(() => Users, (user) => user.securityDevices)
  @JoinColumn({ name: 'userId' })
  user: Users;
}
