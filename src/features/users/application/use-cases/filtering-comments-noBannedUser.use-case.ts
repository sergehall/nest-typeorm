import { CommentsEntity } from '../../../comments/entities/comments.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class FilteringCommentsNoBannedUserCommand {
  constructor(public commentsArr: CommentsEntity[]) {}
}
@CommandHandler(FilteringCommentsNoBannedUserCommand)
export class FilteringCommentsNoBannedUserUseCase
  implements ICommandHandler<FilteringCommentsNoBannedUserCommand>
{
  constructor(protected usersRepository: UsersRepository) {}
  async execute(
    command: FilteringCommentsNoBannedUserCommand,
  ): Promise<CommentsEntity[]> {
    const commentsWithoutBannedUser: CommentsEntity[] = [];
    for (let i = 0; i < command.commentsArr.length; i++) {
      const user = await this.usersRepository.findUserByUserId(
        command.commentsArr[i].commentatorInfo.userId,
      );
      if (user && !user.banInfo.isBanned) {
        commentsWithoutBannedUser.push(command.commentsArr[i]);
      }
    }
    return commentsWithoutBannedUser;
  }
}
