type UnitAmount = {
  currency_code: string;
  value: string;
};

export type Item = {
  name: string;
  description: string;
  quantity: string;
  unit_amount: UnitAmount;
};

type Breakdown = {
  item_total: UnitAmount;
};

export type Amount = {
  currency_code: string;
  value: string;
  breakdown: Breakdown;
};

type Address = {
  address_line_1: string;
  admin_area_2: string;
  postal_code: string;
  country_code: string;
};

export type Shipping = {
  address: Address;
};

export type PayPaPurchaseUnitsType = {
  reference_id: string;
  items: Item[];
  amount: Amount;
  shipping: Shipping;
};
