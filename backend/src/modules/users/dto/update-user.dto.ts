import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\+?[\d\s-]{10,20})?$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
