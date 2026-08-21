export enum PayPalUrlsEnum {
  DeveloperAccounts = 'https://developer.paypal.com/developer/accounts',
  BaseSandboxApi = 'https://api-m.sandbox.paypal.com',
  BaseApi = 'https://api-m.paypal.com',
}

export function getPayPalApiBaseUrl(environment = process.env.NODE_ENV): PayPalUrlsEnum {
  return environment === 'production' ? PayPalUrlsEnum.BaseApi : PayPalUrlsEnum.BaseSandboxApi;
}
