import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('BlacklistJwt')
export class BlacklistJwtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  jwt: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  expirationDate: string;
}
