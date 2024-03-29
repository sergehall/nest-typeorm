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
