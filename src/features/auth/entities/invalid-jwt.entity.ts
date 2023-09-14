import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, Length, Matches } from 'class-validator';

@Entity('InvalidJwt')
export class InvalidJwtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  hashedRefreshToken: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  expirationDate: string;

  // @IsNotEmpty()
  // @Length(3, 10, {
  //   message: 'Incorrect login length! Must be min 3, max 10 ch.',
  // })
  // @Matches('^[a-zA-Z0-9_-]*$')
  // login: string | null;
}
