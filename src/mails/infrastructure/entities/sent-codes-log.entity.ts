import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UsersEntity } from '../../../features/users/entities/users.entity';

@Entity('SentCodeLog')
export class SentCodesLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  sentCodeTime: string;

  @ManyToOne(() => UsersEntity, (user) => user, { nullable: false })
  @JoinColumn([
    { name: 'email', referencedColumnName: 'email' },
    { name: 'userId', referencedColumnName: 'userId' },
  ])
  sentForUser: UsersEntity;
}
