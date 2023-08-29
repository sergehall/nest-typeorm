import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('InvalidJwt')
export class InvalidJwtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  refreshToken: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  expirationDate: string;
}
