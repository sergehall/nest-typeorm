import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Action } from '../../../ability/roles/action.enum';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegDataDto } from '../dto/reg-data.dto';
import { CreateUserCommand } from '../application/use-cases/create-user.use-case';
import { UpdateUserCommand } from '../application/use-cases/update-user.use-case';
import { RemoveUserByIdCommand } from '../application/use-cases/remove-user-byId.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { CurrentUserDto } from '../dto/currentUser.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { TablesUsersWithIdEntity } from '../entities/tables-user-with-id.entity';
import { ReturnUserDto } from '../dto/return-user.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { UsersEntity } from '../entities/users.entity';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected commandBus: CommandBus,
    protected parseQueries: ParseQueriesService,
  ) {}

  @Get()
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async findUsers(@Query() query: any): Promise<PaginatedResultDto> {
    const queryData: ParseQueriesDto = await this.parseQueries.getQueriesData(
      query,
    );

    return this.usersService.findUsers(queryData);
  }

  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async findUserByUserId(
    @Param() params: IdParams,
  ): Promise<TablesUsersWithIdEntity> {
    return await this.usersService.findUserByUserId(params.id);
  }

  @Post()
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async createUser(
    @Request() req: any,
    @Body() createUserDto: CreateUserDto,
    @Ip() ip: string,
  ): Promise<ReturnUserDto> {
    const registrationData: RegDataDto = {
      ip: ip,
      userAgent: req.get('user-agent') || 'None',
    };

    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto, registrationData),
    );

    return {
      id: newUser.userId,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param() params: IdParams,
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdateUserCommand(params.id, updateUserDto, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async removeUserById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new RemoveUserByIdCommand(params.id, currentUserDto),
    );
  }
}
