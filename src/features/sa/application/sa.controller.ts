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
  NotFoundException,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { SaService } from './sa.service';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/application/users.service';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { Role } from '../../../ability/roles/role.enum';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateBanDto } from '../dto/update-sa.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveUserByIdCommand } from '../../users/application/use-cases/remove-user-byId.use-case';
import { ChangeRoleCommand } from './use-cases/change-role.use-case';
import { UsersEntity } from '../../users/entities/users.entity';
import { CreateUserCommand } from '../../users/application/use-cases/create-user-byInstance.use-case';
import { BanUserCommand } from './use-cases/ban-user.use-case';
import { ChangeBanStatusCommentsCommand } from '../../comments/application/use-cases/change-banStatus-comments.use-case';
import { ChangeBanStatusPostsCommand } from '../../posts/application/use-cases/change-banStatus-posts.use-case';
import { RemoveDevicesBannedUserCommand } from '../../security-devices/application/use-cases/remove-devices-bannedUser.use-case';
import { IdParams } from '../../common/params/id.params';

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
  async findUsers(@Query() query: any) {
    const queryData = ParseQuery.getPaginationData(query);
    const searchLoginTerm = { searchLoginTerm: queryData.searchLoginTerm };
    const searchEmailTerm = { searchEmailTerm: queryData.searchEmailTerm };
    const banStatus = { banStatus: queryData.banStatus };
    const queryPagination: PaginationDto = {
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      sortBy: queryData.sortBy,
      sortDirection: queryData.sortDirection,
    };
    return this.usersService.findUsers(queryPagination, [
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
    ]);
  }

  @Get('blogs')
  @UseGuards(BaseAuthGuard)
  async findBlogs(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const paginationData = ParseQuery.getPaginationData(query);
    const searchFilters = { searchNameTerm: paginationData.searchNameTerm };
    const queryPagination: PaginationDto = {
      pageNumber: paginationData.pageNumber,
      pageSize: paginationData.pageSize,
      sortBy: paginationData.sortBy,
      sortDirection: paginationData.sortDirection,
    };
    return await this.bloggerBlogsService.findBlogs(queryPagination, [
      searchFilters,
    ]);
  }

  @Post('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: User })
  async createUser(
    @Request() req: any,
    @Body() createUserDto: CreateUserDto,
    @Ip() ip: string,
  ) {
    const userAgent = req.get('user-agent') || 'None user-agent';
    const registrationData = {
      ip: ip,
      userAgent: userAgent,
    };

    const newUser = await this.commandBus.execute(
      new CreateUserCommand(createUserDto, registrationData),
    );
    newUser.roles = Role.SA;
    const saUser: UsersEntity | null = await this.commandBus.execute(
      new ChangeRoleCommand(newUser),
    );
    if (!saUser) throw new NotFoundException();
    return {
      id: saUser.id,
      login: saUser.login,
      email: saUser.email,
      createdAt: saUser.createdAt,
      banInfo: {
        isBanned: saUser.banInfo.isBanned,
        banDate: saUser.banInfo.banDate,
        banReason: saUser.banInfo.banReason,
      },
    };
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async removeUserById(@Request() req: any, @Param() params: IdParams) {
    const currentUser = req.user;
    return await this.commandBus.execute(
      new RemoveUserByIdCommand(params.id, currentUser),
    );
  }
  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async banUser(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateSaBanDto: UpdateBanDto,
  ) {
    const currentUser = req.user;
    await this.commandBus.execute(
      new RemoveDevicesBannedUserCommand(params.id),
    );
    await this.commandBus.execute(
      new ChangeBanStatusCommentsCommand(params.id, updateSaBanDto.isBanned),
    );
    await this.commandBus.execute(
      new ChangeBanStatusPostsCommand(params.id, updateSaBanDto.isBanned),
    );
    return await this.commandBus.execute(
      new BanUserCommand(params.id, updateSaBanDto, currentUser),
    );
  }
}
