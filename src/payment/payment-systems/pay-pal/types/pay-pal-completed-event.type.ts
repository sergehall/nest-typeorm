export type PayPalCompletedEventType = {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  resource_version: string;
  event_type: string;
  summary: string;
  resource: {
    payee: {
      email_address: string;
      merchant_id: string;
    };
    amount: {
      value: string;
      currency_code: string;
    };
    seller_protection: {
      dispute_categories: string[];
      status: string;
    };
    supplementary_data: {
      related_ids: {
        order_id: string;
      };
    };
    update_time: string;
    create_time: string;
    final_capture: boolean;
    seller_receivable_breakdown: {
      paypal_fee: {
        value: string;
        currency_code: string;
      };
      gross_amount: {
        value: string;
        currency_code: string;
      };
      net_amount: {
        value: string;
        currency_code: string;
      };
    };
    links: {
      method: string;
      rel: string;
      href: string;
    }[];
    id: string;
    status: string;
  };
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
};
