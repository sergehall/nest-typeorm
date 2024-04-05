export type StripeCheckoutSessionObjectType = {
  id: string;
  object: string;
  after_expiration: string | null;
  allow_promotion_codes: boolean | null;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: {
    enabled: boolean;
    liability: string | null;
    status: string | null;
  };
  billing_address_collection: string | null;
  cancel_url: string;
  client_reference_id: string;
  client_secret: string | null;
  consent: string | null;
  consent_collection: string | null;
  created: number;
  currency: string;
  currency_conversion: string | null;
  custom_fields: any[];
  custom_text: {
    after_submit: string | null;
    shipping_address: string | null;
    submit: string | null;
    terms_of_service_acceptance: string | null;
  };
  customer: string | null;
  customer_creation: string;
  customer_details: {
    address: {
      city: string | null;
      country: string;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
    tax_exempt: string;
    tax_ids: any[];
  };
  customer_email: string | null;
  expires_at: number;
  invoice: string | null;
  invoice_creation: {
    enabled: boolean;
    invoice_data: {
      account_tax_ids: any[] | null;
      custom_fields: any[] | null;
      description: string | null;
      footer: string | null;
      issuer: string | null;
      metadata: Record<string, any>;
      rendering_options: any[] | null;
    };
  };
  livemode: boolean;
  locale: string | null;
  metadata: Record<string, any>;
  mode: string;
  payment_intent: string;
  payment_link: string | null;
  payment_method_collection: string;
  payment_method_configuration_details: any;
  payment_method_options: {
    card: {
      request_three_d_secure: string;
    };
  };
  payment_method_types: string[];
  payment_status: string;
  phone_number_collection: {
    enabled: boolean;
  };
  recovered_from: string | null;
  setup_intent: string | null;
  shipping_address_collection: string | null;
  shipping_cost: number | null;
  shipping_details: string | null;
  shipping_options: any[];
  status: string;
  submit_type: string | null;
  subscription: string | null;
  success_url: string;
  total_details: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
  ui_mode: string;
  url: string | null;
};
