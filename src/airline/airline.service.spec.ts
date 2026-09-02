import { Test, TestingModule } from '@nestjs/testing';
import { AirlineService } from './airline.service';
import { PrismaService } from 'src/database/prisma.service';

describe('AirlineService', () => {
  let service: AirlineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirlineService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<AirlineService>(AirlineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
