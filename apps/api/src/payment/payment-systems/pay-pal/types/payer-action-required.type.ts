import { isRecord } from '../../../../common/http/external-json-client';

export type PayerActionRequiredType = {
  id: string;
  status: string;
  payment_source: {
    paypal: Record<string, never>; // Assuming empty object for now
  };
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
};

export function isPayerActionRequired(value: unknown): value is PayerActionRequiredType {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.status !== 'string' ||
    !isRecord(value.payment_source) ||
    !Array.isArray(value.links)
  ) {
    return false;
  }

  return value.links.every(
    (link) =>
      isRecord(link) &&
      typeof link.href === 'string' &&
      typeof link.rel === 'string' &&
      typeof link.method === 'string',
  );
}
