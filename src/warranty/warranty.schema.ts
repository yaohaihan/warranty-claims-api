import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';
import { Product } from '../products/product.schema';

@Schema()
export class WarrantyClaim extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer: User;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ required: true })
  issueDescription: string;

  @Prop({ default: 'pending' })
  status: string;  // Possible values: 'pending', 'approved', 'rejected'

  @Prop({ default: Date.now })
  createdAt: Date;
}