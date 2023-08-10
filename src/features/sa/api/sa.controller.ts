import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Ip,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { SaService } from '../application/sa.service';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/application/users.service';
import { Action } from '../../../ability/roles/action.enum';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeRoleCommand } from '../application/use-cases/sa-change-role.use-case';
import { CreateUserCommand } from '../../users/application/use-cases/create-user.use-case';
import { IdParams } from '../../common/query/params/id.params';
import { SaBanUserDto } from '../dto/sa-ban-user..dto';
import { SaBanBlogDto } from '../dto/sa-ban-blog.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { IdUserIdParams } from '../../common/query/params/idUserId.params';
import { SaRemoveUserByUserIdCommand } from '../application/use-cases/sa-remove-user-by-user-id.use-case';
import { SaBindBlogWithUserCommand } from '../application/use-cases/sa-bind-blog-with-user.use-case';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { TablesUsersWithIdEntity } from '../../users/entities/tables-user-with-id.entity';
import { SaBanUserByUserIdCommand } from '../application/use-cases/sa-ban-unban-user.use-case';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ReturnUsersBanInfoEntity } from '../entities/return-users-banInfo.entity';
import { SaBanUnbanBlogForUserCommand } from '../application/use-cases/sa-ban-unban-blog-for-user.use-case';

@SkipThrottle()
@Controller('sa')
export class SaController {
  constructor(
    private saService: SaService,
    private parseQueriesService: ParseQueriesService,
    private usersService: UsersService,
    private bloggerBlogsService: BloggerBlogsService,
    private commandBus: CommandBus,
  ) {}

  @Get('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async saFindUsers(@Query() query: any): Promise<PaginationTypes> {
    const queryData = await this.parseQueriesService.getQueriesData(query);

    return this.usersService.saFindUsers(queryData);
  }

  @Get('blogs')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async saFindBlogs(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const queryData = await this.parseQueriesService.getQueriesData(query);

    return await this.bloggerBlogsService.saFindBlogs(queryData);
  }

  @Post('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async saCreateUser(
    @Request() req: any,
    @Body() createUserDto: CreateUserDto,
    @Ip() ip: string,
  ): Promise<ReturnUsersBanInfoEntity> {
    const userAgent = req.get('user-agent') || 'None';
    const registrationData = {
      ip: ip,
      userAgent: userAgent,
    };

    const newUser: TablesUsersWithIdEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto, registrationData),
    );

    const saUser: TablesUsersWithIdEntity = await this.commandBus.execute(
      new ChangeRoleCommand(newUser),
    );

    return {
      id: saUser.id,
      login: saUser.login,
      email: saUser.email,
      createdAt: saUser.createdAt,
      banInfo: {
        isBanned: saUser.isBanned,
        banDate: saUser.banDate,
        banReason: saUser.banReason,
      },
    };
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async removeUserById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaRemoveUserByUserIdCommand(params.id, currentUserDto),
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

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saBanUserById(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateSaBanDto: SaBanUserDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUserByUserIdCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }

  @Put('blogs/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saBanBlogsByBlogId(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() saBanBlogDto: SaBanBlogDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUnbanBlogForUserCommand(params.id, saBanBlogDto, currentUserDto),
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
      new SaBanUserByUserIdCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }
}
