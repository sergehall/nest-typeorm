import { IsInt, IsNotEmpty, IsObject, IsString } from 'class-validator';

class ProductDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}

export class BuyRequestDto {
  @IsObject()
  @IsNotEmpty()
  products: ProductDto[];
}
