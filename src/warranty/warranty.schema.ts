import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarrantyClaimDocument = WarrantyClaim & Document;

@Schema()
export class WarrantyClaim {
    @Prop({ required: true })
    productId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    description: string;

    @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
    status: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const WarrantyClaimSchema = SchemaFactory.createForClass(WarrantyClaim);
