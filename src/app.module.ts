import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { CustomersModule } from './customers/customers.module';
import { AirlineModule } from './airline/airline.module';
import { FlightBookingsModule } from './flight-bookings/flight-bookings.module';
import { VisaModule } from './visa/visa.module';
import { DocumentsModule } from './documents/documents.module';
import { HotelBookingsModule } from './hotel-bookings/hotel-bookings.module';
import { HotelPartnersModule } from './hotel-partners/hotel-partners.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { PackageCategoriesModule } from './package-categories/package-categories.module';
import { PackagesModule } from './packages/packages.module';
import { PackageBookingsModule } from './package-bookings/package-bookings.module';
import { CalendarEventTypesModule } from './calendar-event-types/calendar-event-types.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { StaffSchedulesModule } from './staff-schedules/staff-schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    RoleModule,
    PermissionModule,
    CustomersModule,
    AirlineModule,
    FlightBookingsModule,
    VisaModule,
    DocumentsModule,
    HotelBookingsModule,
    HotelPartnersModule,
    RoomTypesModule,
    PackageCategoriesModule,
    PackagesModule,
    PackageBookingsModule,
    CalendarEventTypesModule,
    CalendarEventsModule,
    StaffSchedulesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
