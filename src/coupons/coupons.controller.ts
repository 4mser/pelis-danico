// src/coupons/coupons.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon, CouponOwners } from './schemas/coupon.schema';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /** Crea un cupón para Nico o Barbara */
  @Post()
  async addCoupon(
    @Body() body: {
      title: string;
      description: string;
      owner: typeof CouponOwners[number];
    },
  ): Promise<Coupon> {
    return this.couponsService.addCoupon(
      body.title,
      body.description,
      body.owner,
    );
  }

  /** Lista todos o filtra por owner (p.ej. ?owner=Nico) */
  @Get()
  async getAll(@Query('owner') owner?: Coupon['owner']): Promise<Coupon[]> {
    if (owner) {
      return this.couponsService.getCouponsByOwner(owner);
    }
    return this.couponsService.getAllCoupons();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Coupon> {
    return this.couponsService.getCouponById(id);
  }

  @Patch(':id/redeem')
  async redeem(
    @Param('id') id: string,
    @Body() body: { redeemed: boolean },
  ): Promise<Coupon> {
    return this.couponsService.redeemCoupon(id, body.redeemed);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.couponsService.deleteCoupon(id);
  }
}
