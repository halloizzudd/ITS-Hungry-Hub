import { IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../entities/order.entity'; // Enum import

class OrderItem {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  sellerId: number;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  items: OrderItem[];
}
