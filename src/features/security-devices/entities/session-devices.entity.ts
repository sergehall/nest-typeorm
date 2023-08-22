import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('SecurityDevices')
@Unique(['userId', 'deviceId'])
export class SecurityDevicesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: false, unique: true })
  deviceId: string;

  @Column({
    type: 'varchar',
    length: 20,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  ip: string;

  @Column({
    type: 'varchar',
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  lastActiveDate: string;

  @Column({
    type: 'varchar',
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  expirationDate: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
