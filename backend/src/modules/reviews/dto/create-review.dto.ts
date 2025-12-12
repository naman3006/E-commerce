import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional() // Made optional
  comment?: string;
}
