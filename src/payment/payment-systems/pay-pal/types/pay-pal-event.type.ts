export type PayPalEventType = {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  resource_version: string;
  event_type: string;
  summary: string;
  resource: {
    create_time: string;
    purchase_units: {
      reference_id: string;
      amount: {
        currency_code: string;
        value: string;
        breakdown: {
          item_total: {
            currency_code: string;
            value: string;
          };
        };
      };
      payee: {
        email_address: string;
        merchant_id: string;
        display_data: {
          brand_name: string;
        };
      };
      items: {
        name: string;
        unit_amount: {
          currency_code: string;
          value: string;
        };
        quantity: string;
        description: string;
      }[];
      shipping: {
        name: {
          full_name: string;
        };
        address: {
          address_line_1: string;
          address_line_2: string;
          admin_area_2: string;
          admin_area_1: string;
          postal_code: string;
          country_code: string;
        };
      };
    }[];
    links: {
      href: string;
      rel: string;
      method: string;
    }[];
    id: string;
    payment_source: {
      paypal: {
        email_address: string;
        account_id: string;
        account_status: string;
        name: {
          given_name: string;
          surname: string;
        };
        address: {
          country_code: string;
        };
      };
    };
    intent: string;
    payer: {
      name: {
        given_name: string;
        surname: string;
      };
      email_address: string;
      payer_id: string;
      address: {
        country_code: string;
      };
    };
    status: string;
  };
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
};
