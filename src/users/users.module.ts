import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User, UserSchema } from './user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // MongoDB模型
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],  // 注册用户控制器
  providers: [UserService],       // 注册用户服务
  exports: [UserService],         // 导出服务供其他模块（如 AuthModule）使用
})
export class UserModule {}
