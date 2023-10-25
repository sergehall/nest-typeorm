import { UsersEntity } from '../../users/entities/users.entity';

export class UpdatedConfirmationCodeEvent {
  constructor(public userEntity: UsersEntity) {}
}
