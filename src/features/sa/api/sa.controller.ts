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
import { SkipThrottle } from '@nestjs/throttler';
import { SaService } from '../application/sa.service';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/application/users.service';
import { Action } from '../../../ability/roles/action.enum';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeRoleCommand } from '../application/use-cases/sa-change-role.use-case';
import { CreateUserCommand } from '../../users/application/use-cases/create-user-byInstance.use-case';
import { IdParams } from '../../common/params/id.params';
import { SaBanUserDto } from '../dto/sa-ban-user..dto';
import { SaBanBlogDto } from '../dto/sa-ban-blog.dto';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { TablesUsersEntityWithId } from '../../users/entities/userRawSqlWithId.entity';
import { SaBanBlogByBlogIdCommand } from '../application/use-cases/sa-ban-blog-byBlogId.use-case';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { IdUserIdParams } from '../../common/params/idUserId.params';
import { SaRemoveUserByUserIdCommand } from '../application/use-cases/sa-remove-user-byUserId.use-case';
import { SaBindBlogWithUserCommand } from '../application/use-cases/sa-bind-blog-with-user.use-case';
import { SaBanUserByUserIdCommand } from '../application/use-cases/sa-ban-user.use-case';

@SkipThrottle()
@Controller('sa')
export class SaController {
  constructor(
    private saService: SaService,
    private usersService: UsersService,
    private bloggerBlogsService: BloggerBlogsService,
    private commandBus: CommandBus,
  ) {}

  @Get('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async saFindUsers(@Query() query: any) {
    const queryData = ParseQuery.getPaginationData(query);
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
    const queryData = ParseQuery.getPaginationData(query);
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
  ) {
    const userAgent = req.get('user-agent') || 'None user-agent';
    const registrationData = {
      ip: ip,
      userAgent: userAgent,
    };

    const newUser: TablesUsersEntityWithId = await this.commandBus.execute(
      new CreateUserCommand(createUserDto, registrationData),
    );
    newUser.roles = RolesEnums.SA;
    const saUser: TablesUsersEntityWithId = await this.commandBus.execute(
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
  async removeUserById(@Request() req: any, @Param() params: IdParams) {
    const currentUserDto = req.user;
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
    const currentUserDto = req.user;
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
      new SaBanBlogByBlogIdCommand(params.id, saBanBlogDto, currentUserDto),
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
