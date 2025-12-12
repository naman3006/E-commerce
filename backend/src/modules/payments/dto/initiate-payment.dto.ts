import { IsString, IsNotEmpty } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
