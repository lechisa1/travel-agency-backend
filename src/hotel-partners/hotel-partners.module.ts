import { Module } from '@nestjs/common';
import { HotelPartnersService } from './hotel-partners.service';
import { HotelPartnersController } from './hotel-partners.controller';

@Module({
  providers: [HotelPartnersService],
  controllers: [HotelPartnersController],
  exports: [HotelPartnersService],
})
export class HotelPartnersModule {}