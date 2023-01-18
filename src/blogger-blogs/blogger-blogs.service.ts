import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { BloggerBlogsEntity } from './entities/blogger-blogs.entity';
import { PostsService } from '../posts/posts.service';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { CurrentUserDto } from '../auth/dto/currentUser.dto';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../ability/roles/action.enum';
import { CreatePostAndNameDto } from '../posts/dto/create-post-and-name.dto';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { QueryArrType } from '../infrastructure/common/convert-filters/types/convert-filter.types';
import { PaginationTypes } from '../infrastructure/common/pagination/types/pagination.types';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { BloggerBlogsOwnerDto } from './dto/blogger-blogs-owner.dto';
import { UpdatePostBloggerBlogsDto } from './dto/update-post-blogger-blogs.dto';
import { UpdateBBlogsDto } from './dto/update-blogger-blogs.dto';
import { BloggerBlogsRepository } from './infrastructure/blogger-blogs.repository';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    private bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    private postsService: PostsService,
  ) {}
  async findBlogs(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    let field = 'createdAt';
    if (
      queryPagination.sortBy === 'name' ||
      queryPagination.sortBy === 'websiteUrl' ||
      queryPagination.sortBy === 'description'
    ) {
      field = queryPagination.sortBy;
    }
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.findBlogs(pagination, convertedFilters);
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }
  async findBlogsByUserId(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    let field = 'createdAt';
    if (
      queryPagination.sortBy === 'name' ||
      queryPagination.sortBy === 'websiteUrl' ||
      queryPagination.sortBy === 'description'
    ) {
      field = queryPagination.sortBy;
    }
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.findBlogsByUserId(
        pagination,
        convertedFilters,
      );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async createBlog(blogsOwnerDto: BloggerBlogsOwnerDto) {
    const blogsEntity = {
      ...blogsOwnerDto,
      id: uuid4().toString(),
      createdAt: new Date().toISOString(),
    };
    const newBlog: BloggerBlogsEntity =
      await this.bloggerBlogsRepository.createBlogs(blogsEntity);
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
    };
  }
  async findBlogById(id: string): Promise<BloggerBlogsEntity | null> {
    return this.bloggerBlogsRepository.findBlogById(id);
  }
  async createPost(createPostDto: CreatePostDto, currentUser: CurrentUserDto) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(createPostDto.blogId);
    if (!blog) throw new NotFoundException();

    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: currentUser.id,
      });
      const createPost: CreatePostAndNameDto = {
        title: createPostDto.title,
        shortDescription: createPostDto.shortDescription,
        content: createPostDto.content,
        blogId: blog.id,
        name: blog.name,
      };
      const blogOwnerInfo = {
        userId: blog.blogOwnerInfo.userId,
        userLogin: blog.blogOwnerInfo.userLogin,
        isBanned: blog.blogOwnerInfo.isBanned,
      };
      return await this.postsService.createPost(createPost, blogOwnerInfo);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async updateBlogById(
    id: string,
    updateBlogDto: UpdateBBlogsDto,
    currentUser: CurrentUserDto,
  ) {
    const blogToUpdate: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(id);
    if (!blogToUpdate) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToUpdate.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.id,
      });
      const blogEntity: BloggerBlogsEntity = {
        id: blogToUpdate.id,
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
        createdAt: blogToUpdate.createdAt,
        blogOwnerInfo: {
          userId: blogToUpdate.blogOwnerInfo.userId,
          userLogin: blogToUpdate.blogOwnerInfo.userLogin,
          isBanned: blogToUpdate.blogOwnerInfo.isBanned,
        },
      };
      return await this.bloggerBlogsRepository.updatedBlogById(blogEntity);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async removeBlogById(id: string, currentUser: CurrentUserDto) {
    const blogToDelete = await this.bloggerBlogsRepository.findBlogById(id);
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToDelete.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUser.id,
      });
      return await this.bloggerBlogsRepository.removeBlogById(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async updatePostByPostId(
    blogId: string,
    postId: string,
    updatePostBBlogDto: UpdatePostBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();

    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUser.id,
      });
      const updatePostDto = { ...updatePostBBlogDto, blogId: blogId };
      return await this.postsService.updatePost(postId, updatePostDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
  async removePostByPostId(
    blogId: string,
    postId: string,
    currentUser: CurrentUserDto,
  ): Promise<boolean | undefined> {
    const blogToDelete = await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToDelete.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUser.id,
      });

      return await this.postsService.removePost(postId);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}
