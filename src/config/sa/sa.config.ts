import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { BasicAuthType } from './types/basic-auth.type';
import { SaLoginType } from './types/sa-login.type';
import { SaEmailType } from './types/sa-email.type';
import { SaKeyType } from './types/sa-key.type';
import { SaPasswordHashType } from './types/sa-password-hash.type';
import { Fernet } from 'fernet-nodejs';

@Injectable()
export class SaConfig extends BaseConfig {
  async getBasicAuth(basicAuth: BasicAuthType): Promise<string> {
    return await this.getValueBasicAuth(basicAuth);
  }

  async getSaLogin(saLogin: SaLoginType): Promise<string> {
    return await this.getValueSaLogin(saLogin);
  }

  async getSaEmail(basicAuth: SaEmailType): Promise<string> {
    return await this.getValueSaEmail(basicAuth);
  }

  async getSaKey(saKey: SaKeyType): Promise<string> {
    return await this.getValueSaSaKey(saKey);
  }

  async getSaPasswordHash(saPasswordHash: SaPasswordHashType): Promise<string> {
    return await this.getValueSaPasswordHash(saPasswordHash);
  }

  async decryptingSaPassword(saPasswordHash: string): Promise<string> {
    try {
      const saKey = await this.getSaKey('SA_KEY');
      const f = new Fernet(saKey);

      return f.decrypt(saPasswordHash);
    } catch (error) {
      console.error('Error decrypting SA password:', error);
      throw error; // Re-throwing the error for the caller to handle
    }
  }
}
