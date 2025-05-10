import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
  } from '@nestjs/common';
  import { CouponsService } from './coupons.service';
  
  @Controller('coupons') // Ruta base: /coupons
  export class CouponsController {
    constructor(private readonly couponsService: CouponsService) {}
  
    @Post()
    async addCoupon(
      @Body() body: { title: string; description: string },
    ) {
      return this.couponsService.addCoupon(body.title, body.description);
    }
  
    @Get()
    async getAll() {
      return this.couponsService.getAllCoupons();
    }
  
    @Get(':id')
    async getOne(@Param('id') id: string) {
      return this.couponsService.getCouponById(id);
    }
  
    @Patch(':id/redeem')
    async redeem(
      @Param('id') id: string,
      @Body() body: { redeemed: boolean },
    ) {
      return this.couponsService.redeemCoupon(id, body.redeemed);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.couponsService.deleteCoupon(id);
    }
  }
  