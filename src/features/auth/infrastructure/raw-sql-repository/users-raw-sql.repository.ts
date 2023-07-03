import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserRawSqlEntity } from '../../../users/entities/createUserRawSql.entity';
import { CreateUserRawSqlWithIdEntity } from '../../../users/entities/createUserRawSqlWithId.entity';
import { TablesUsersEntity } from '../../../users/entities/tablesUsers.entity';

@Injectable()
export class UsersRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async createUser(
    createUserRawSql: CreateUserRawSqlEntity,
  ): Promise<CreateUserRawSqlWithIdEntity> {
    try {
      const insertNewUser = await this.db.query(
        `
        INSERT INTO public."Users"
        ( "login", 
          "email", 
          "passwordHash", 
          "createdAt", 
          "orgId", 
          "roles", 
          "isBanned", 
          "banDate", 
          "banReason", 
          "confirmationCode", 
          "expirationDate", 
          "isConfirmed", 
          "isConfirmedDate",
          "ip",
          "userAgent")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          returning id`,
        [
          createUserRawSql.login.toLowerCase(),
          createUserRawSql.email,
          createUserRawSql.passwordHash,
          createUserRawSql.createdAt,
          createUserRawSql.orgId,
          createUserRawSql.roles,
          createUserRawSql.banInfo.isBanned,
          createUserRawSql.banInfo.banDate,
          createUserRawSql.banInfo.banReason,
          createUserRawSql.emailConfirmation.confirmationCode,
          createUserRawSql.emailConfirmation.expirationDate,
          createUserRawSql.emailConfirmation.isConfirmed,
          createUserRawSql.emailConfirmation.isConfirmedDate,
          createUserRawSql.registrationData.ip,
          createUserRawSql.registrationData.userAgent,
        ],
      );
      return { id: insertNewUser[0].id, ...createUserRawSql };
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<TablesUsersEntity | null> {
    try {
      const user = await this.db.query(
        `
      SELECT "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
      FROM public."Users"
      WHERE "confirmationCode" = $1`,
        [confirmationCode],
      );
      return user[0] ? user[0] : null;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async confirmUserByConfirmCode(
    confirmationCode: string,
    isConfirmed: boolean,
    isConfirmedDate: string,
  ): Promise<boolean> {
    try {
      const user = await this.db.query(
        `
      UPDATE public."Users"
      SET  "isConfirmed" = $2, "isConfirmedDate" = $3
      WHERE "confirmationCode" = $1`,
        [confirmationCode, isConfirmed, isConfirmedDate],
      );
      return !!user[0];
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}
