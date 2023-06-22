import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth-pg')
export class AuthPgEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
// import { Entity } from 'typeorm';
// import { BaseEntity } from './base-entity';
//
// @Entity('auth-pg')
// export class AuthPgEntity extends BaseEntity {
//   id: string;
//   createdAt: Date;
//   updatedAt: Date;
// }
// class User {
//   id: string;
//   createdAt: Date;
//   updatedAt: Date;
// }
// class Profile {
//   id: string;
//   createdAt: Date;
//   updatedAt: Date;
// }
