// src/stats/stats.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Stats, StatsSchema } from './schemas/stats.schema';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stats.name, schema: StatsSchema }]),
    ScheduleModule.forRoot(),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
