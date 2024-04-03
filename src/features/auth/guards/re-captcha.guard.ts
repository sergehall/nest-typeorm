import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ReCaptchaConfig } from '../../../config/recaptcha/re-captcha.config';

@Injectable()
export class ReCaptchaGuard extends ReCaptchaConfig implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const reCaptchaToken = request.body.reCaptchaToken; // Assuming the token is sent in the request body

    // If reCaptchaToken is missing or undefined, deny access
    if (!reCaptchaToken) {
      return false;
    }

    const secretKey = await this.getReCaptchaValue('RECAPTCHA_SECRET_KEY');
    const url = 'https://www.google.com/recaptcha/api/siteverify';

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', reCaptchaToken);
    formData.append('remoteip', request.ip);

    try {
      const response = await axios.post(url, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { success, score } = response.data;

      if (!success || score < 0.8) {
        return false;
      }

      // If reCAPTCHA validation is successful, allow access
      return true;
    } catch (error) {
      // Log or handle error
      console.error('Error occurred while verifying reCAPTCHA token:', error);
      return false; // Deny access in case of error
    }
  }
}
