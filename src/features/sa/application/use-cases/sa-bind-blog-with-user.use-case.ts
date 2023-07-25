import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { IdUserIdParams } from '../../../common/params/idUserId.params';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';

export class SaBindBlogWithUserCommand {
  constructor(
    public params: IdUserIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBindBlogWithUserCommand)
export class SaBindBlogWithUserUseCase
  implements ICommandHandler<SaBindBlogWithUserCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(command: SaBindBlogWithUserCommand): Promise<boolean> {
    return true;
  }
}
