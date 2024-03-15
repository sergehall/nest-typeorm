import { IsNotEmpty, Validate } from 'class-validator';

class ProductDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  quantity: number;
}

class IsArrayAndNotEmpty {
  validate(array: any[]) {
    return !(!Array.isArray(array) || array.length === 0);
  }

  defaultMessage() {
    return 'products must be a non-empty array';
  }
}

export class BuyRequestDto {
  @Validate(IsArrayAndNotEmpty)
  products: ProductDto[];
}
