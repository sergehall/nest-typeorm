import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ReCaptchaConfig } from '../../../config/recaptcha/re-captcha.config';

@Injectable()
export class ReCaptchaGuard extends ReCaptchaConfig implements CanActivate {
  /**
   * Determines whether the request should be allowed based on the provided reCAPTCHA token.
   * @param context The execution context.
   * @returns A boolean indicating whether the request should be allowed.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const reCaptchaToken = request.body.reCaptchaToken;

    // If reCaptchaToken is missing or undefined, deny access.
    if (!reCaptchaToken) {
      return false;
    }

    // Retrieve reCAPTCHA secret key from configuration
    const secretKey = await this.getReCaptchaValue('RECAPTCHA_SECRET_KEY');

    // Construct URL for reCAPTCHA verification endpoint
    const url = 'https://www.google.com/recaptcha/api/siteverify';

    console.log('secretKey:', secretKey);
    // Construct form data for POST request
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', reCaptchaToken);
    formData.append('remoteip', request.ip);

    try {
      // Send POST request to reCAPTCHA verification endpoint
      const response = await axios.post(url, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Extract response data
      const { success, score } = response.data;

      // If reCAPTCHA validation fails or score is below threshold, deny access
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
