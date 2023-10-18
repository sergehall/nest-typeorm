import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityTuple,
  MatchConditions,
  PureAbility,
} from '@casl/ability';
import { Action } from './roles/action.enum';
import { IdDto } from './dto/id.dto';
import { CurrentUserDto } from '../features/users/dto/current-user.dto';
import { UserRolesEnums } from './enums/user-roles.enums';

type AppAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class CaslAbilityFactory {
  createSaUser(currentUser: CurrentUserDto) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);
    if (currentUser.roles.includes(UserRolesEnums.SA)) {
      can(Action.MANAGE, 'all');
      cannot(
        Action.CREATE,
        'User',
        ({ orgId }) => orgId !== currentUser.orgId,
      ).because('Because different organizations');
    } else {
      can(Action.READ, 'all');
      can(Action.CREATE, 'all');
      can(Action.UPDATE, 'all', ({ id }) => id === currentUser.userId);
      can(Action.DELETE, 'all', ({ id }) => id === currentUser.userId);
      cannot(Action.CREATE, 'all', ({ isBanned }) => isBanned === true);
      cannot(Action.UPDATE, 'all', ({ orgId }) => orgId !== currentUser.orgId);
      cannot(Action.CREATE, 'all', ({ orgId }) => orgId !== currentUser.orgId);
    }
    return build({ conditionsMatcher: lambdaMatcher });
  }
  createForUserId(userId: IdDto) {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);
    can(Action.READ, 'all');
    can(Action.CREATE, 'all', ({ id }) => id === userId.id);
    can(Action.UPDATE, 'all', ({ id }) => id === userId.id);
    can(Action.DELETE, 'all', ({ id }) => id === userId.id);
    return build({ conditionsMatcher: lambdaMatcher });
  }
}
