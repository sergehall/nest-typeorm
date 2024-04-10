import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Action } from '../../../ability/roles/action.enum';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { SaBasicAuthGuard } from '../../auth/guards/sa-basic-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user.use-case';
import { UpdateUserCommand } from '../application/use-cases/update-user.use-case';
import { RemoveUserByIdCommand } from '../application/use-cases/remove-user-byId.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { CurrentUserDto } from '../dto/current-user.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { PaginatorDto } from '../../../common/helpers/paginator.dto';
import { UsersEntity } from '../entities/users.entity';
import { FindUsersCommand } from '../application/use-cases/find-users.use-case';
import { FindUserByICommand } from '../application/use-cases/find-user-by-id.use-case';
import { UserViewModel } from '../views/user.view-model';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocService } from '../../../api-documentation/api-doc-service';
import { EndpointKeys } from '../../../api-documentation/enums/endpoint-keys.enum';
import { UsersMethods } from '../../../api-documentation/enums/users-methods.enum';

@SkipThrottle()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    protected commandBus: CommandBus,
    protected parseQueries: ParseQueriesService,
  ) {}

  @Get()
  @UseGuards(SaBasicAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async findUsers(@Query() query: any): Promise<PaginatorDto> {
    const queryData: ParseQueriesDto =
      await this.parseQueries.getQueriesData(query);

    return await this.commandBus.execute(new FindUsersCommand(queryData));
  }

  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async findUserByUserId(@Param() params: IdParams): Promise<UsersEntity> {
    return await this.commandBus.execute(new FindUserByICommand(params.id));
  }

  @ApiDocService.apply(EndpointKeys.Users, UsersMethods.CreateUser)
  @Post()
  @UseGuards(SaBasicAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
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
  @UseGuards(SaBasicAuthGuard)
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
