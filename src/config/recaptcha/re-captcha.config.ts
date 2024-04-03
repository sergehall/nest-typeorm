import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { ReCaptchaKeyType } from './types/re-captcha-key.type';

@Injectable()
export class ReCaptchaConfig extends BaseConfig {
  private config: Record<string, string> = {
    RECAPTCHA_SITE_KEY: 'RECAPTCHA_SITE_KEY',
    RECAPTCHA_SECRET_KEY: 'RECAPTCHA_SECRET_KEY',
  };

  async getReCaptchaValueByKey(key: ReCaptchaKeyType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueReCaptcha(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in PayPal configuration`,
      );
    }
  }
  async getReCaptchaValue(key: ReCaptchaKeyType): Promise<string> {
    return this.getReCaptchaValueByKey(key);
  }
}
