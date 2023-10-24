import { UsersEntity } from '../entities/users.entity';

export class RegistrationUserEvent {
  constructor(public userEntity: UsersEntity) {}
}
