import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getCombinedStats() {
    return this.statsService.getCombinedStats();
  }

  @Get('coupons')
  async getCouponStats() {
    return this.statsService.getCouponStats();
  }

  @Get('movies')
  async getMovieStats() {
    return this.statsService.getMovieStats();
  }

  @Get('products')
  async getProductStats() {
    return this.statsService.getProductStats();
  }
}