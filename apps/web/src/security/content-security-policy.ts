const NONCE_PATTERN = /^[A-Za-z0-9+/=_-]{16,}$/;

export function createWebContentSecurityPolicy(nonce: string, development: boolean): string {
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
    "frame-src 'none'",
    "img-src 'self' data: blob:",
    "manifest-src 'self'",
    "media-src 'none'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'none'",
    "worker-src 'self' blob:",
    ...(!development ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}
