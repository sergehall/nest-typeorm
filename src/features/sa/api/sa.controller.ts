import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { Action } from '../../../ability/roles/action.enum';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/application/use-cases/create-user.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { SaBanUserDto } from '../dto/sa-ban-user..dto';
import { SaBanBlogDto } from '../dto/sa-ban-blog.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { IdUserIdParams } from '../../../common/query/params/id-userId.params';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ReturnUsersBanInfoEntity } from '../entities/return-users-banInfo.entity';
import { SaBanUnbanBlogCommand } from '../application/use-cases/sa-ban-unban-blog-for-user.use-case';
import { SaBanUnbanUserCommand } from '../application/use-cases/sa-ban-unban-user.use-case';
import { SaBindBlogWithUserCommand } from '../application/use-cases/sa-bind-blog-with-user.use-case';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChangeRoleCommand } from '../application/use-cases/sa-change-role.use-case';
import { SaFindUsersCommand } from '../application/use-cases/sa-find-users.use-case';
import { SaDeleteUserByUserIdCommand } from '../application/use-cases/sa-delete-user-by-user-id.use-case';
import { CreateBloggerBlogsDto } from '../../blogger-blogs/dto/create-blogger-blogs.dto';
import { SaCreateBlogCommand } from '../application/use-cases/sa-create-blog.use-case';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { SaGetBlogByIdCommand } from '../application/use-cases/sa-get-blog-by-id.use-case';

@SkipThrottle()
@Controller('sa')
export class SaController {
  constructor(
    private parseQueriesService: ParseQueriesService,
    private commandBus: CommandBus,
  ) {}

  @Get('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async saFindUsers(@Query() query: any): Promise<PaginatedResultDto> {
    const queryData = await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(new SaFindUsersCommand(queryData));
  }

  @Get('blogs')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async searchBlogsForSa(@Query() query: any): Promise<PaginatedResultDto> {
    const queryData = await this.parseQueriesService.getQueriesData(query);
    return await this.commandBus.execute(new SaFindUsersCommand(queryData));
  }

  @Get('blogs/:id')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async getBlogById(
    @Param('id', BlogExistValidationPipe) id: string,
  ): Promise<boolean> {
    return await this.commandBus.execute(new SaGetBlogByIdCommand(id));
  }

  @Post('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async saCreateUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUsersBanInfoEntity> {
    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    return await this.commandBus.execute(new ChangeRoleCommand(newUser.userId));
  }

  @Post('blogs')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async saCreateBlog(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBloggerBlogsDto,
  ): Promise<ReturnUsersBanInfoEntity> {
    const currentUserDto = req.user;

    return await this.commandBus.execute(
      new SaCreateBlogCommand(createBBlogsDto, currentUserDto),
    );
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async deleteUserById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaDeleteUserByUserIdCommand(params.id, currentUserDto),
    );
  }

  @Put('blogs/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saBanBlog(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() saBanBlogDto: SaBanBlogDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUnbanBlogCommand(params.id, saBanBlogDto, currentUserDto),
    );
  }

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saBanUnbanUser(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateSaBanDto: SaBanUserDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUnbanUserCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }

  @Put('blogs/:id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async bindBlogWithUser(
    @Request() req: any,
    @Param() params: IdUserIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaBindBlogWithUserCommand(params, currentUserDto),
    );
  }

  @Put('blogs/:id/ban-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async banBlogWithUser(
    @Request() req: any,
    @Param() params: IdUserIdParams,
    @Body() updateSaBanDto: SaBanUserDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUnbanUserCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }
}
