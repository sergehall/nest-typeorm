import * as uuid4 from 'uuid4';
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
import { TableBloggerBlogsRawSqlEntity } from '../../entities/table-blogger-blogs-raw-sql.entity';
import { ReturnBloggerBlogsDto } from '../../dto/return-blogger-blogs.dto';

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
  ): Promise<ReturnBloggerBlogsDto> {
    this.checkPermission(command.currentUser);

    const blogsEntity = this.createBlogsEntity(
      command.createBloggerBlogsDto,
      command.currentUser,
    );

    return await this.bloggerBlogsRawSqlRepository.createBlogs(blogsEntity);
  }

  private createBlogsEntity(
    dto: CreateBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ): TableBloggerBlogsRawSqlEntity {
    const { id, login, isBanned } = currentUser;

    return {
      ...dto,
      id: uuid4(),
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerId: id,
      blogOwnerLogin: login,
      dependencyIsBanned: isBanned,
      banInfoIsBanned: false,
      banInfoBanDate: null,
      banInfoBanReason: null,
    };
  }

  private checkPermission(currentUserDto: CurrentUserDto): void {
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
