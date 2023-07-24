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
import { SaService } from '../application/sa.service';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/application/users.service';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveUserByIdCommand } from '../../users/application/use-cases/remove-user-byId.use-case';
import { ChangeRoleCommand } from '../application/use-cases/change-role.use-case';
import { CreateUserCommand } from '../../users/application/use-cases/create-user-byInstance.use-case';
import { SaBanUserCommand } from '../application/use-cases/sa-ban-user.use-case';
import { IdParams } from '../../common/params/id.params';
import { SaBanUserDto } from '../dto/sa-ban-user..dto';
import { SaBanBlogDto } from '../dto/sa-ban-blog.dto';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { TablesUsersEntityWithId } from '../../users/entities/userRawSqlWithId.entity';
import { SaBanBlogByBlogIdCommand } from '../application/use-cases/sa-ban-blog-byBlogId.use-case';

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
  @CheckAbilities({ action: Action.READ, subject: User })
  async saFindUsers(@Query() query: any) {
    const queryData = ParseQuery.getPaginationData(query);
    return this.usersService.findUsersRawSql(queryData);
  }

  @Get('blogs')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async saFindBlogs(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const queryData = ParseQuery.getPaginationData(query);
    return await this.bloggerBlogsService.saOpenFindBlogs(queryData);
  }

  @Post('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: User })
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
      new RemoveUserByIdCommand(params.id, currentUserDto),
    );
  }
  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async banUser(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateSaBanDto: SaBanUserDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUserCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }
  @Put('blogs/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async banSaBlogsByBlogId(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() saBanBlogDto: SaBanBlogDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanBlogByBlogIdCommand(params.id, saBanBlogDto, currentUserDto),
    );
  }
}
