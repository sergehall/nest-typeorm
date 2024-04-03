import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ReCaptchaConfig } from '../../../config/recaptcha/re-captcha.config';
import { RecaptchaResponse } from '../../../adapters/recaptcha/types/recaptcha-response.type';

@Injectable()
export class ReCaptchaGuard extends ReCaptchaConfig implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const reCaptchaToken = request.body.reCaptchaToken; // Assuming the token is sent in the request body

    // Add your secret key here
    const secretKey = await this.getReCaptchaValue('RECAPTCHA_SECRET_KEY');

    const url = 'https://www.google.com/recaptcha/api/siteverify';

    const headersOption = {
      'Content-Type': 'application/x-www-form-urlencoded',
      params: {
        body: `secret=${secretKey}&response=${reCaptchaToken}&remoteip=${request.ip}`,
      },
    };

    try {
      const response: RecaptchaResponse = await axios.post(
        url,
        {},
        headersOption,
      );

      const { success } = response;

      // If reCAPTCHA validation is successful, allow access
      return success;
    } catch (error) {
      // Log or handle error
      console.error('Error occurred while verifying reCAPTCHA token:', error);
      return false; // Deny access in case of error
    }
  }
}
