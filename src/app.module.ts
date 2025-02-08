import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    // 连接本地 MongoDB 数据库
    MongooseModule.forRoot('mongodb://yaohaihan:hhelibeblxyhh123@34.87.43.170:8888/warranty_db?authSource=warranty_db'),
    UserModule,
  ],
})
export class AppModule {}