import { Test, TestingModule } from '@nestjs/testing';
import { FlightBookingsController } from './flight-bookings.controller';

describe('FlightBookingsController', () => {
  let controller: FlightBookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightBookingsController],
    }).compile();

    controller = module.get<FlightBookingsController>(FlightBookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
