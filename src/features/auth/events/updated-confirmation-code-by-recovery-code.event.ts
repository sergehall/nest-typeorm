import { UsersEntity } from '../../users/entities/users.entity';

export class UpdatedConfirmationCodeByRecoveryCodeEvent {
  constructor(public userEntity: UsersEntity) {}
}
