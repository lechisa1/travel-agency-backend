import { Test, TestingModule } from '@nestjs/testing';
import { FlightBookingsService } from './flight-bookings.service';

describe('FlightBookingsService', () => {
  let service: FlightBookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightBookingsService],
    }).compile();

    service = module.get<FlightBookingsService>(FlightBookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
