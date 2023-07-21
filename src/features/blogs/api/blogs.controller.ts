import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { IdParams } from '../../common/params/id.params';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { BlogIdParams } from '../../common/params/blogId.params';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}

  @Get()
  @CheckAbilities({ action: Action.READ, subject: User })
  async openFindBlogs(@Query() query: any): Promise<PaginationTypes> {
    const queryData = ParseQuery.getPaginationData(query);
    return await this.blogsService.openFindBlogs(queryData);
  }

  @Get(':id')
  @CheckAbilities({ action: Action.READ, subject: User })
  async openFindBlogById(
    @Param() params: IdParams,
  ): Promise<ReturnBloggerBlogsEntity> {
    return await this.blogsService.openFindBlogById(params.id);
  }
  @Get(':blogId/posts')
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async openFindPostsByBlogId(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData = ParseQuery.getPaginationData(query);
    return await this.blogsService.openFindPostsByBlogId(
      params,
      queryData,
      currentUserDto,
    );
  }
}
