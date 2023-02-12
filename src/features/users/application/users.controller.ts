import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { Action } from '../../../ability/roles/action.enum';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { User } from '../infrastructure/schemas/user.schema';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegDataDto } from '../dto/reg-data.dto';
import { CreateUserCommand } from './use-cases/create-user-byInstance.use-case';
import { UpdateUserCommand } from './use-cases/update-user.use-case';
import { RemoveUserByIdCommand } from './use-cases/remove-user-byId.use-case';
import { IdParams } from '../../common/params/id.params';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findUsers(@Query() query: any) {
    const queryData = ParseQuery.getPaginationData(query);
    const searchLoginTerm = { searchLoginTerm: queryData.searchLoginTerm };
    const searchEmailTerm = { searchEmailTerm: queryData.searchEmailTerm };
    const queryPagination: PaginationDto = {
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      sortBy: queryData.sortBy,
      sortDirection: queryData.sortDirection,
    };
    return this.usersService.findUsers(queryPagination, [
      searchLoginTerm,
      searchEmailTerm,
    ]);
  }

  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findUserByUserId(@Param() params: IdParams) {
    return this.usersService.findUserByUserId(params.id);
  }

  @Post()
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: User })
  async createUser(
    @Request() req: any,
    @Body() createUserDto: CreateUserDto,
    @Ip() ip: string,
  ) {
    const registrationData: RegDataDto = {
      ip: ip,
      userAgent: req.get('user-agent') || 'None',
    };
    const newUser = await this.commandBus.execute(
      new CreateUserCommand(createUserDto, registrationData),
    );
    return {
      id: newUser.id,
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
  ) {
    const currentUser = req.user;
    const result = await this.commandBus.execute(
      new UpdateUserCommand(params.id, updateUserDto, currentUser),
    );
    if (!result) throw new NotFoundException();
    return result;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async removeUserById(@Request() req: any, @Param() params: IdParams) {
    const currentUser = req.user;
    return await this.commandBus.execute(
      new RemoveUserByIdCommand(params.id, currentUser),
    );
  }
}
