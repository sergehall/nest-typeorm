import { SetMetadata } from '@nestjs/common';
import { Action } from './roles/action.enum';
import { User } from '../users/infrastructure/schemas/user.schema';
import { Subject } from '@casl/ability';

export interface RequiredRule {
  action: Action;
  subject: Subject;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

export class ReadUserAbility implements RequiredRule {
  action = Action.READ;
  subject = User;
}

// example in Controller under the decorator @Post, @Get, ...
// @Post
// @UseGuards(AbilitiesGuard)
//@CheckAbilities(new ReadUserAbility())
