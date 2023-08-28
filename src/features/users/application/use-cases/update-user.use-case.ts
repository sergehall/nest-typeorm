import { UpdateUserDto } from '../../dto/update-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../dto/currentUser.dto';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersWithIdEntity } from '../../entities/tables-user-with-id.entity';

export class UpdateUserCommand {
  constructor(
    public id: string,
    public updateUserDto: UpdateUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}
@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<UpdateUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async execute(command: UpdateUserCommand): Promise<boolean> {
    const { id, updateUserDto, currentUserDto } = command;

    const userToUpdate: TablesUsersWithIdEntity | null =
      await this.usersRawSqlRepository.findUserByUserId(id);

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.checkUserPermission(userToUpdate, currentUserDto);

    // Call DB  to update user
    console.log(updateUserDto, `This action update a #${id} user`);
    return true;
  }
  private async checkUserPermission(
    userToUpdate: TablesUsersWithIdEntity,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
