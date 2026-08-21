import { addCspNonceToStyleElements, createContentSecurityPolicy } from './content-security-policy';

const nonce = 'test-nonce-with-sufficient-entropy';

describe('Content security policy', () => {
  it('creates a strict local policy without unsafe inline execution or HTTPS upgrades', () => {
    const policy = createContentSecurityPolicy(nonce, false);

    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain(`style-src 'self' 'nonce-${nonce}'`);
    expect(policy).toContain("script-src-attr 'none'");
    expect(policy).toContain("style-src-attr 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).not.toContain("'unsafe-inline'");
    expect(policy).not.toContain('upgrade-insecure-requests');
  });

  it('upgrades insecure requests only in a hardened runtime', () => {
    expect(createContentSecurityPolicy(nonce, true)).toContain('upgrade-insecure-requests');
  });

  it('adds the request nonce only to style elements that do not already have one', () => {
    const html = '<style>.one { color: red; }</style><style nonce="existing">.two {}</style>';
    const result = addCspNonceToStyleElements(html, nonce);

    expect(result).toContain(`<style nonce="${nonce}">.one`);
    expect(result).toContain('<style nonce="existing">.two');
  });
});
