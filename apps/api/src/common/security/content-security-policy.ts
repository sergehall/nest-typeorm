import { randomBytes } from 'node:crypto';
import { Response } from 'express';

type CspResponseLocals = {
  cspNonce?: string;
};

const NONCE_PATTERN = /^[A-Za-z0-9_-]{22,}$/;

export function ensureResponseCspNonce(response: Response): string {
  const locals = (response.locals ??= {}) as CspResponseLocals;
  const existingNonce = locals.cspNonce;

  if (existingNonce && NONCE_PATTERN.test(existingNonce)) {
    return existingNonce;
  }

  const nonce = randomBytes(18).toString('base64url');
  locals.cspNonce = nonce;
  return nonce;
}

export function createContentSecurityPolicy(nonce: string, hardenedRuntime: boolean): string {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new Error('A valid CSP nonce is required.');
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "manifest-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'none'",
    "worker-src 'none'",
    ...(hardenedRuntime ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

export function addCspNonceToStyleElements(html: string, nonce: string): string {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new Error('A valid CSP nonce is required.');
  }

  return html.replace(/<style(?![^>]*\bnonce=)([^>]*)>/g, `<style nonce="${nonce}"$1>`);
}
