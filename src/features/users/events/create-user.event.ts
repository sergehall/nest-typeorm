import { UsersEntity } from '../entities/users.entity';

export class CreateUserEvent {
  constructor(public userEntity: UsersEntity) {}
}
