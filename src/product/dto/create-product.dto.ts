import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Product name' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Product description' })
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Product price' })
  price: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Product category' })
  category: string;
}
