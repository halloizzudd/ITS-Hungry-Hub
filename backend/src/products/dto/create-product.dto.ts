import { IsString, IsNumber, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsInt()
  @Type(() => Number)
  stock: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  prepTime?: number = 5; // default value
}
