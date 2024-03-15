// interface Address {
//   city: string | null;
//   country: string;
//   line1: string | null;
//   line2: string | null;
//   postal_code: string;
//   state: string | null;
// }
//
// interface Checks {
//   address_line1_check: string | null;
//   address_postal_code_check: string;
//   cvc_check: string;
// }
//
// interface Card {
//   amount_authorized: number;
//   brand: string;
//   checks: Checks;
//   country: string;
//   exp_month: number;
//   exp_year: number;
//   extended_authorization: {
//     status: string;
//   } | null;
//   fingerprint: string;
//   funding: string;
//   incremental_authorization: {
//     status: string;
//   } | null;
//   installments: null;
//   last4: string;
//   mandate: null;
//   multicapture: {
//     status: string;
//   } | null;
//   network: string;
//   network_token: {
//     used: boolean;
//   };
//   overcapture: {
//     maximum_amount_capturable: number;
//     status: string;
//   } | null;
//   three_d_secure: null;
//   wallet: null;
// }
//
// interface BillingDetails {
//   address: Address;
//   email: string;
//   name: string;
//   phone: string | null;
// }
//
// interface Outcome {
//   network_status: string;
//   reason: string | null;
//   risk_level: string;
//   risk_score: number;
//   seller_message: string;
//   type: string;
// }
//
// interface PaymentMethodDetails {
//   card: Card;
//   type: string;
// }
//
// interface StripeCharge {
//   id: string;
//   object: string;
//   amount: number;
//   amount_captured: number;
//   amount_refunded: number;
//   application: string | null;
//   application_fee: string | null;
//   application_fee_amount: string | null;
//   balance_transaction: string;
//   billing_details: BillingDetails;
//   calculated_statement_descriptor: string | null;
//   captured: boolean;
//   created: number;
//   currency: string;
//   customer: null;
//   description: null;
//   destination: null;
//   dispute: null;
//   disputed: boolean;
//   failure_balance_transaction: null;
//   failure_code: null;
//   failure_message: null;
//   fraud_details: {};
//   invoice: null;
//   livemode: boolean;
//   metadata: {};
//   on_behalf_of: null;
//   order: null;
//   outcome: Outcome;
//   paid: boolean;
//   payment_intent: string;
//   payment_method: string;
//   payment_method_details: PaymentMethodDetails;
//   radar_options: {};
//   receipt_email: null;
//   receipt_number: null;
//   receipt_url: string;
//   refunded: boolean;
//   review: null;
//   shipping: null;
//   source: null;
//   source_transfer: null;
//   statement_descriptor: null;
//   statement_descriptor_suffix: null;
//   status: string;
//   transfer_data: null;
//   transfer_group: null;
// }
//
// export interface StripeEvent {
//   object: StripeCharge;
//   livemode: boolean;
//   pending_webhooks: number;
//   request: {
//     id: string;
//     idempotency_key: string;
//   };
//   type: string;
// }
