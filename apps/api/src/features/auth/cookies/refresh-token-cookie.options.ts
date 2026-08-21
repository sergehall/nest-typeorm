import { CookieOptions } from 'express';
import { isHardenedRuntime } from '../../../common/environment/runtime-environment';

export function getRefreshTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isHardenedRuntime(),
    sameSite: 'lax',
    path: '/auth',
  };
}
