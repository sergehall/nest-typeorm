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
import { BaseAuthGuard } from '../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../ability/abilities.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { CheckAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/roles/action.enum';
import { User } from '../users/infrastructure/schemas/user.schema';
import { Role } from '../ability/roles/role.enum';
import { ParseQuery } from '../infrastructure/common/parse-query/parse-query';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { PaginationTypes } from '../infrastructure/common/pagination/types/pagination.types';
import { BloggerBlogsService } from '../blogger-blogs/blogger-blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateBanDto } from './dto/update-sa.dto';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';

@SkipThrottle()
@Controller('sa')
export class SaController {
  constructor(
    private saService: SaService,
    private usersService: UsersService,
    private blogsService: BloggerBlogsService,
    private securityDevicesService: SecurityDevicesService,
    private commentsService: CommentsService,
    private postsService: PostsService,
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
    return this.usersService.findAll(queryPagination, [
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
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
    const newUser = await this.usersService.createUser(
      createUserDto,
      registrationData,
    );
    newUser.roles = Role.SA;
    const saUser = await this.usersService.changeRole(newUser);
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
  async removeUserById(@Request() req: any, @Param('id') id: string) {
    const currentUser = req.user;
    return await this.usersService.removeUserById(id, currentUser);
  }
  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async banUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateSaBanDto: UpdateBanDto,
  ) {
    const currentUser = req.user;
    await this.securityDevicesService.removeDevicesBannedUser(id);
    await this.commentsService.changeBanStatusComments(
      id,
      updateSaBanDto.isBanned,
    );
    await this.postsService.changeBanStatusPosts(id, updateSaBanDto.isBanned);
    return await this.usersService.banUser(id, updateSaBanDto, currentUser);
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
    return await this.blogsService.findBlogs(queryPagination, [searchFilters]);
  }
}
