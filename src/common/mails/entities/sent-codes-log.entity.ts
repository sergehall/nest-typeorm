import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UsersEntity } from '../../../features/users/entities/users.entity';

@Entity('SentCodesLog')
export class SentCodesLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  sentCodeTime: string;

  @ManyToOne(() => UsersEntity, (user) => user, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'userId', referencedColumnName: 'userId' },
    { name: 'email', referencedColumnName: 'email' },
  ])
  sentForUser: UsersEntity;
}
