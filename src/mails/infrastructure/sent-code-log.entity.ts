import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('SentCodeLog')
export class SentCodeLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  sentCodeTime: string;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  email: string;

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
