import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('BlacklistJwt')
export class BlacklistJwtEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  jwt: string;

  @Column({
    type: 'varchar',
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  expirationDate: string;

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
