import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WarrantyService } from './warranty.service';
import { WarrantyController } from './warranty.controller';
import { WarrantyClaim, WarrantyClaimSchema } from './warranty.schema';
import { Product, ProductSchema } from '../product/product.schema';  // 引入 Product 模型

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: WarrantyClaim.name, schema: WarrantyClaimSchema },
        { name: Product.name, schema: ProductSchema },  
      ]),
    ],
    controllers: [WarrantyController],
    providers: [WarrantyService],
})
export class WarrantyModule {}
