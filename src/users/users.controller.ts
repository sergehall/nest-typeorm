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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseQuery } from '../infrastructure/common/parse-query/parse-query';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { Action } from '../ability/roles/action.enum';
import { CheckAbilities } from '../ability/abilities.decorator';
import { AbilitiesGuard } from '../ability/abilities.guard';
import { User } from './infrastructure/schemas/user.schema';
import { BaseAuthGuard } from '../auth/guards/base-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as process from 'process';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
    const newUser = await this.usersService.createUser(
      createUserDto,
      registrationData,
    );
    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  @Get()
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findAll(@Query() query: any) {
    console.log(process.env.THROTTLE_LIMIT);
    const queryData = ParseQuery.getPaginationData(query);
    const searchLoginTerm = { searchLoginTerm: queryData.searchLoginTerm };
    const searchEmailTerm = { searchEmailTerm: queryData.searchEmailTerm };
    const queryPagination: PaginationDto = {
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      sortBy: queryData.sortBy,
      sortDirection: queryData.sortDirection,
    };
    return this.usersService.findAll(queryPagination, [
      searchLoginTerm,
      searchEmailTerm,
    ]);
  }

  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findUserByUserId(@Param('id') id: string) {
    return this.usersService.findUserByUserId(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const currentUser = req.user;
    const result = this.usersService.updateUser(id, updateUserDto, currentUser);
    if (!result) throw new NotFoundException();
    return result;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async removeUserById(@Request() req: any, @Param('id') id: string) {
    const currentUser = req.user;
    return await this.usersService.removeUserById(id, currentUser);
  }
}
