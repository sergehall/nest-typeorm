import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CreateBloggerBlogsDto } from '../../dto/create-blogger-blogs.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { ReturnBloggerBlogsEntity } from '../../entities/return-blogger-blogs.entity';

export class CreateBloggerBlogCommand {
  constructor(
    public createBloggerBlogsDto: CreateBloggerBlogsDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(CreateBloggerBlogCommand)
export class CreateBloggerBlogUseCase
  implements ICommandHandler<CreateBloggerBlogCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(
    command: CreateBloggerBlogCommand,
  ): Promise<ReturnBloggerBlogsEntity> {
    const { createBloggerBlogsDto, currentUser } = command;
    await this.checkPermission(command.currentUser);

    return await this.bloggerBlogsRawSqlRepository.createBlogs(
      createBloggerBlogsDto,
      currentUser,
    );
  }

  private async checkPermission(currentUserDto: CurrentUserDto): Promise<void> {
    // In the future, you can add a checkPermission
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(
        Action.CREATE,
        currentUserDto,
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
