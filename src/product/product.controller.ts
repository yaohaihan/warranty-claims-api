import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards,Request, ForbiddenException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Product')
@ApiBearerAuth()      
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create Product (staff only)' })
    async createProduct(@Body() createProductDto: CreateProductDto,@Request() req) {
      if (req.user.role !== 'staff') {
        throw new ForbiddenException('You do not have permission to perform this action');
      }
      return this.productService.createProduct(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'View all products' })
    async getAllProducts() {
      return this.productService.getAllProducts();
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Update product By id (staff only)' })
    async updateProduct(@Param('id') id: string, @Body() updateData: Partial<CreateProductDto>, @Request() req) {
      if (req.user.role !== 'staff') {
        throw new ForbiddenException('You do not have permission to perform this action');
      }
      return this.productService.updateProduct(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete product By id (staff only)' })
    async deleteProduct(@Param('id') id: string, @Request() req) {
      if (req.user.role !== 'staff') {
        throw new ForbiddenException('You do not have permission to perform this action');
      }
      await this.productService.deleteProduct(id);
      return { message: 'Product deleted successfully' };
    }
}
