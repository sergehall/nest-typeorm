import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityTuple,
  MatchConditions,
  PureAbility,
} from '@casl/ability';
import { Role } from './roles/role.enum';
import { Action } from './roles/action.enum';
import { UserIdEntity } from '../features/comments/entities/userId.entity';
import { PostsIdEntity } from '../features/posts/entities/postsId.entity';
import { UsersEntity } from '../features/users/entities/users.entity';
import { BloggerBlogsBlogIdEntity } from '../features/blogger-blogs/entities/blogger-blogs-blogId.entity';

type AppAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UsersEntity) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);
    if (user.roles === Role.SA) {
      can(Action.MANAGE, 'all');
      cannot(
        Action.CREATE,
        'User',
        ({ orgId }) => orgId !== user.orgId,
      ).because('Because different organizations');
    } else {
      can(Action.READ, 'all');
      can(Action.CREATE, 'all');
      can(Action.UPDATE, 'all', ({ id }) => id === user.id);
      can(Action.DELETE, 'all', ({ id }) => id === user.id);
      cannot(Action.UPDATE, 'all', ({ orgId }) => orgId !== user.orgId);
      cannot(Action.CREATE, 'all', ({ orgId }) => orgId !== user.orgId);
    }
    return build({ conditionsMatcher: lambdaMatcher });
  }
  createForPost(post: PostsIdEntity) {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);
    can(Action.READ, 'all');
    can(Action.CREATE, 'all');
    can(Action.UPDATE, 'all', ({ id }) => id === post.id);
    can(Action.DELETE, 'all', ({ id }) => id === post.id);
    return build({ conditionsMatcher: lambdaMatcher });
  }
  createForComments(user: UserIdEntity) {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);
    can(Action.READ, 'all');
    can(Action.CREATE, 'all');
    can(Action.UPDATE, 'all', ({ id }) => id === user.id);
    can(Action.DELETE, 'all', ({ id }) => id === user.id);
    return build({ conditionsMatcher: lambdaMatcher });
  }
  createForBBlogger(blogger: BloggerBlogsBlogIdEntity) {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);
    can(Action.READ, 'all');
    can(Action.CREATE, 'all', ({ id }) => id === blogger.id);
    can(Action.UPDATE, 'all', ({ id }) => id === blogger.id);
    can(Action.DELETE, 'all', ({ id }) => id === blogger.id);
    return build({ conditionsMatcher: lambdaMatcher });
  }
}
