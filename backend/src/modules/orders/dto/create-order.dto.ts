// import {
//   IsString,
//   IsNumber,
//   IsArray,
//   IsNotEmpty,
//   IsEnum,
// } from 'class-validator';
// import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

// class OrderItem {
//   @IsString()
//   @IsNotEmpty()
//   productId: string;

//   @IsNumber()
//   @IsNotEmpty()
//   quantity: number;

//   @IsNumber()
//   @IsNotEmpty()
//   price: number;
// }

// export class CreateOrderDto {
//   @IsArray()
//   items: OrderItem[];

//   @IsNumber()
//   totalAmount: number;

//   @IsEnum(PaymentStatus)
//   paymentStatus: PaymentStatus = PaymentStatus.pending;

//   @IsEnum(OrderStatus)
//   orderStatus: OrderStatus = OrderStatus.pending;

//   @IsString()
//   shippingAddress: string;
// }

import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

class OrderItem {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  @IsNotEmpty()
  items: OrderItem[];

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus = PaymentStatus.pending;

  @IsEnum(OrderStatus)
  orderStatus: OrderStatus = OrderStatus.pending;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsOptional()
  appliedCoupon?: string;
}
