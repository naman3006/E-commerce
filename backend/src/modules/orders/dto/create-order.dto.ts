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

class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
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

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsString()
  @IsOptional()
  appliedCoupon?: string;
}
