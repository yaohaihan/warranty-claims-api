import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWarrantyClaimDto {
//dto没必要写入userId  payload中已经有了，在service创建warranty时添加进去就行

    @ApiProperty({ description: 'Id of the product for which the claim is being created' })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Description of the issue' })
    description: string;
}
