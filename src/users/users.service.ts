import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import * as bcrypt from 'bcrypt';
import * as uuid4 from 'uuid4';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { Role } from '../ability/roles/role.enum';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../ability/roles/action.enum';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { UsersRepository } from './infrastructure/users.repository';
import { RegDataDto } from './dto/reg-data.dto';
import {
  BanInfo,
  User,
  UsersDocument,
} from './infrastructure/schemas/user.schema';
import { PaginationTypes } from '../infrastructure/common/pagination/types/pagination.types';
import { UsersEntity } from './entities/users.entity';
import { QueryArrType } from '../infrastructure/common/convert-filters/types/convert-filter.types';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { EmailConfimCodeEntity } from '../mails/entities/email-confim-code.entity';
import { OrgIdEnums } from '../infrastructure/database/enums/org-id.enums';
import { userNotExists } from '../exception-filter/errors-messages';
import { UpdateBanDto } from '../sa/dto/update-sa.dto';
import { CommentsEntity } from '../comments/entities/comments.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
    protected mailsRepository: MailsRepository,
  ) {}
  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
  }
  async userAlreadyExist(login: string, email: string): Promise<string | null> {
    return await this.usersRepository.userAlreadyExist(login, email);
  }
  async createUserUseModel(
    createUserDto: CreateUserDto,
    registrationData: RegDataDto,
  ): Promise<UsersEntity> {
    const user = await this._createNewUser(createUserDto, registrationData);
    return await this.usersRepository.createUser(user);
  }

  async createUser(
    createUserDto: CreateUserDto,
    registrationData: RegDataDto,
  ): Promise<UsersDocument> {
    const newInstance = await this.usersRepository.makeInstanceUser(
      createUserDto,
      registrationData,
    );
    await this.usersRepository.save(newInstance);
    return newInstance;
  }

  async createUserRegistration(
    createUserDto: CreateUserDto,
    registrationData: RegDataDto,
  ): Promise<UsersDocument> {
    const newInstance = await this.usersRepository.makeInstanceUser(
      createUserDto,
      registrationData,
    );
    await this.usersRepository.save(newInstance);

    const newConfirmationCode: EmailConfimCodeEntity = {
      id: uuid4().toString(),
      email: newInstance.email,
      confirmationCode: newInstance.emailConfirmation.confirmationCode,
      createdAt: new Date().toISOString(),
    };
    await this.mailsRepository.createEmailConfirmCode(newConfirmationCode);
    return newInstance;
  }
  async updateAndSentConfirmationCodeByEmail(email: string): Promise<boolean> {
    const user = await this.findUserByLoginOrEmail(email);
    const expirationDate = new Date(Date.now() + 65 * 60 * 1000).toISOString();
    if (user && !user.emailConfirmation.isConfirmed) {
      if (user.emailConfirmation.expirationDate > new Date().toISOString()) {
        user.emailConfirmation.confirmationCode = uuid4().toString();
        user.emailConfirmation.expirationDate = expirationDate;
        // update user
        await this.usersRepository.updateUserConfirmationCode(user);

        const newEmailConfirmationCode = {
          id: uuid4().toString(),
          email: user.email,
          confirmationCode: user.emailConfirmation.confirmationCode,
          createdAt: new Date().toISOString(),
        };
        // add Email to emailsToSentRepository
        await this.mailsRepository.createEmailConfirmCode(
          newEmailConfirmationCode,
        );
      }
      return true;
    } else {
      throw new HttpException(
        { message: [userNotExists] },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    let field = 'createdAt';
    if (
      queryPagination.sortBy === 'login' ||
      queryPagination.sortBy === 'email'
    ) {
      field = queryPagination.sortBy;
    }
    const pageNumber = queryPagination.pageNumber;
    const pageSize = queryPagination.pageSize;

    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const totalCount = await this.usersRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / pageSize);
    const pagination = await this.pagination.convert(queryPagination, field);
    const posts = await this.usersRepository.findUsers(
      pagination,
      convertedFilters,
    );
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: posts,
    };
  }

  async findUserByUserId(userId: string): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByUserId(userId);
  }

  async confirmByCodeInParams(code: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCode(code);
    if (user) {
      if (!user.emailConfirmation.isConfirmed) {
        if (user.emailConfirmation.expirationDate > new Date().toISOString()) {
          user.emailConfirmation.isConfirmed = true;
          user.emailConfirmation.isConfirmedDate = new Date().toISOString();
          await this.usersRepository.updateUser(user);
          return true;
        }
      }
    }
    return false;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: UsersEntity,
  ) {
    // const userToUpdate = await this.usersService.findOne(id);
    // const userToUpdate = await this.findOne(id);
    const userToUpdate = currentUser;
    userToUpdate.id = currentUser.id;
    userToUpdate.orgId = currentUser.orgId;
    userToUpdate.roles = currentUser.roles;

    const ability = this.caslAbilityFactory.createForUser(currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
      //Update call DB
      return `This action update a #${id} user`;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  async addSentEmailTime(email: string) {
    const currentTime = new Date().toISOString();
    return await this.usersRepository.addSentEmailTime(email, currentTime);
  }

  async removeUserById(id: string, currentUser: User) {
    const userToDelete = await this.usersRepository.findUserByUserId(id);
    if (!userToDelete) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForUser(currentUser);
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, userToDelete);
      return this.usersRepository.removeUserById(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
  async changeRole(newUser: UsersEntity): Promise<UsersEntity | null> {
    return await this.usersRepository.changeRole(newUser);
  }
  async commentsWithoutBannedUser(
    commentsArr: CommentsEntity[],
  ): Promise<CommentsEntity[]> {
    const commentsWithoutBannedUser: CommentsEntity[] = [];
    for (let i = commentsArr.length; i > 0; i--) {
      const user = await this.usersRepository.findUserByUserId(
        commentsArr[i].userId,
      );
      if (user && !user.banInfo.isBanned) {
        commentsWithoutBannedUser.push(commentsArr[i]);
      }
      console.log(commentsArr[i]);
    }
    return commentsWithoutBannedUser;
  }
  async banUser(
    id: string,
    updateBanDto: UpdateBanDto,
    currentUser: User,
  ): Promise<boolean | undefined> {
    const userToBan = await this.usersRepository.findUserByUserId(id);
    if (!userToBan) throw new NotFoundException();
    let updateBan: BanInfo = {
      isBanned: updateBanDto.isBanned,
      banDate: null,
      banReason: null,
    };
    if (updateBanDto.isBanned) {
      updateBan = {
        isBanned: updateBanDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: updateBanDto.banReason,
      };
    }
    try {
      const ability = this.caslAbilityFactory.createForUser(currentUser);
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, userToBan);
      return this.usersRepository.banUser(userToBan, updateBan);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }

  async _createNewUser(
    createUserDto: CreateUserDto,
    registrationData: RegDataDto,
  ): Promise<UsersEntity> {
    const passwordHash = await this._generateHash(createUserDto.password);
    const id = uuid4().toString();
    const currentTime = new Date().toISOString();
    const confirmationCode = uuid4().toString();
    // expiration date in an 1 hour 5 min
    const expirationDate = new Date(Date.now() + 65 * 60 * 1000).toISOString();
    return {
      id: id,
      login: createUserDto.login,
      email: createUserDto.email,
      passwordHash: passwordHash,
      createdAt: currentTime,
      orgId: OrgIdEnums.IT_INCUBATOR,
      roles: Role.User,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: confirmationCode,
        expirationDate: expirationDate,
        isConfirmed: false,
        isConfirmedDate: null,
        sentEmail: [],
      },
      registrationData: {
        ip: registrationData.ip,
        userAgent: registrationData.userAgent,
      },
    };
  }

  async _generateHash(password: string) {
    const saltRounds = Number(process.env.SALT_FACTOR);
    const saltHash = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, saltHash);
  }
}
