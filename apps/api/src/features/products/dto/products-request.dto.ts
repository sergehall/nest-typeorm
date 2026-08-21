import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductRequest {
  @IsUUID('4')
  productId: string;

  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}

export class ProductsRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductRequest)
  products: ProductRequest[];
}
