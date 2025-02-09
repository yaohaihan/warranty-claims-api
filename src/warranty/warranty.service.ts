import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WarrantyClaimDocument } from './warranty.schema';
import { CreateWarrantyClaimDto } from './dto/create-warranty-claim.dto';
import { ProductDocument } from '../product/product.schema';  // 引入 ProductDocument

@Injectable()
export class WarrantyService {
    constructor(
        @InjectModel('WarrantyClaim') private warrantyModel: Model<WarrantyClaimDocument>,
        @InjectModel('Product') private productModel: Model<ProductDocument>,  // 注入 Product 模型
    ) {}

    async getAllWarrantyClaims(): Promise<WarrantyClaimDocument[]> {
        return this.warrantyModel.find().exec();
    }

    async approveOrRejectWarrantyClaim(claimId: string, status: 'approved' | 'rejected'): Promise<WarrantyClaimDocument> {
        const claim = await this.warrantyModel.findById(claimId).exec();
        if (!claim) {
          throw new NotFoundException(`Warranty claim with ID ${claimId} not found`);
        }
    
        // 更新状态
        claim.status = status;
        return claim.save();
      }

    

    async createWarrantyClaim(createClaimDto: CreateWarrantyClaimDto, userId: string): Promise<WarrantyClaimDocument> {
        const { productId } = createClaimDto;
        
        const productExists = await this.productModel.findById(productId).exec();
        if (!productExists) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
        }


        // 创建保修请求
        const newClaim = new this.warrantyModel({
        ...createClaimDto,
        userId,
        });
        return newClaim.save();
    }

    async getUserWarrantyClaims(userId: string): Promise<WarrantyClaimDocument[]> {
        return this.warrantyModel.find({ userId }).exec();
    }
}
