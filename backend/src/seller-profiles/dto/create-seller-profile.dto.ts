import { IsString } from 'class-validator';

export class CreateSellerProfileDto {
  @IsString()
  stallName: string;

  @IsString()
  description: string;

  @IsString()
  location: string;
}
