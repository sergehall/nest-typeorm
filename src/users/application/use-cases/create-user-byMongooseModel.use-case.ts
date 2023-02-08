import { CreateUserDto } from '../../dto/create-user.dto';
import { RegDataDto } from '../../dto/reg-data.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersEntity } from '../../entities/users.entity';
import * as uuid4 from 'uuid4';
import { OrgIdEnums } from '../../../infrastructure/database/enums/org-id.enums';
import { Role } from '../../../ability/roles/role.enum';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserByMongooseModelUseCase {
  constructor(private usersRepository: UsersRepository) {}
  async execute(
    createUserDto: CreateUserDto,
    registrationData: RegDataDto,
  ): Promise<UsersEntity> {
    const user = await this._createNewUser(createUserDto, registrationData);
    return await this.usersRepository.createUser(user);
  }
  private async _createNewUser(
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
  private async _generateHash(password: string) {
    const saltRounds = Number(process.env.SALT_FACTOR);
    const saltHash = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, saltHash);
  }
}
