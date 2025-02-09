import { Controller, Post, Get, Body, Request, UseGuards, ForbiddenException, Patch, Param } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyClaimDto } from './dto/create-warranty-claim.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Warranty')  //Swagger的大标题 
@ApiBearerAuth()      //添加认证信息到文档
@Controller('warranty')
export class WarrantyController {
    constructor(private readonly warrantyService: WarrantyService) {}

    @UseGuards(JwtAuthGuard)
    @Post('claim')
    @ApiOperation({ summary: 'Create a warranty claim for product' })  
    async createWarrantyClaim(@Body() createClaimDto: CreateWarrantyClaimDto, @Request() req) {
        if (req.user.role !== 'customer') {
        throw new ForbiddenException('Only customers can create warranty claims');
        }

        return this.warrantyService.createWarrantyClaim(createClaimDto, req.user._id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-claims')
    @ApiOperation({ summary: 'View all my own warranty claims' })
    async getUserWarrantyClaims(@Request() req) {
        return this.warrantyService.getUserWarrantyClaims(req.user._id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('all-claims')
    @ApiOperation({ summary: 'View all warranty claims (staff only)' })
    async getAllWarrantyClaims(@Request() req) {
      if (req.user.role !== 'staff') {
        throw new ForbiddenException('Only staff can view all warranty claims');
      }
  
      return this.warrantyService.getAllWarrantyClaims();
    }
  
    @UseGuards(JwtAuthGuard)
    @Patch('approve-or-reject/:id')
    @ApiOperation({ summary: 'Approve or Reject warranty claim (staff only)' })
    async approveOrRejectWarrantyClaim(@Param('id') claimId: string, @Body('status') status: 'approved' | 'rejected', @Request() req ) {
      //角色只有staff才可以修改状态
      if (req.user.role !== 'staff') {
        throw new ForbiddenException('Only staff can approve or reject warranty claims');
      }
  
      return this.warrantyService.approveOrRejectWarrantyClaim(claimId, status);
    }
}
