import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { UsersEntity } from '../entities/users.entity';
import { TablesUsersWithIdEntity } from '../entities/tables-user-with-id.entity';

export class UsersRepo {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async findUserById(userId: string): Promise<UsersEntity> {
    const user = await this.usersRepository.findBy({ userId: userId });

    if (!user[0]) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user[0];
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersEntity | null> {
    try {
      const user = await this.usersRepository.findOne({
        where: [{ email: loginOrEmail }, { login: loginOrEmail }],
      });

      return user ? user : null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(newUser: TablesUsersWithIdEntity): Promise<UsersEntity> {
    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        const extractedFieldName = this.extractValueFromMessage(error.detail);
        const constraint = error.message.match(/"(.*?)"/)[1];

        const field = extractedFieldName || constraint;

        throw new HttpException(
          {
            message: {
              message: error.message,
              field: field,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUserRole(userId: string): Promise<UsersEntity | null> {
    const newRoles = [UserRolesEnums.SA];

    try {
      // Update the user roles
      const updateResult: UpdateResult = await this.usersRepository.update(
        userId,
        { roles: newRoles },
      );

      if (updateResult.affected === 0) {
        // If no rows were affected, user not found
        return null;
      }

      // Fetch and return the updated user
      return await this.usersRepository.findOneBy({ userId: userId });
    } catch (error) {
      // Handle errors (e.g., database errors)
      throw new Error(`Error updating user role: ${error.message}`);
    }
  }
  private extractValueFromMessage(message: string) {
    const match = /\(([^)]+)\)/.exec(message);
    return match ? match[1] : 'null';
  }
}
