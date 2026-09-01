import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.refreshToken.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.destination.deleteMany({});
  await prisma.hotelBooking.deleteMany({});
  await prisma.airline.deleteMany({});
  await prisma.hotelPartner.deleteMany({});
  await prisma.roomType.deleteMany({});
  await prisma.transferType.deleteMany({});
  await prisma.visaType.deleteMany({});
  await prisma.packageCategory.deleteMany({});
  await prisma.currency.deleteMany({});
  await prisma.leadSource.deleteMany({});
  await prisma.insuranceProvider.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.documentCategory.deleteMany({});
  await prisma.calendarEventType.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const roles = await prisma.role.createMany({
    data: [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'agent', description: 'Travel agent with limited access' },
      { name: 'customer', description: 'Customer with booking access' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded roles:', roles.count);

  const allRoles = await prisma.role.findMany();
  const adminRole = allRoles.find((r) => r.name === 'admin')!;
  const agentRole = allRoles.find((r) => r.name === 'agent')!;
  const customerRole = allRoles.find((r) => r.name === 'customer')!;

  const permissions = await prisma.permission.createMany({
    data: [
      { name: 'users.read', module: 'users', description: 'Read users' },
      { name: 'users.create', module: 'users', description: 'Create users' },
      { name: 'users.update', module: 'users', description: 'Update users' },
      { name: 'users.delete', module: 'users', description: 'Delete users' },
      { name: 'destinations.read', module: 'destinations', description: 'Read destinations' },
      { name: 'destinations.create', module: 'destinations', description: 'Create destinations' },
      { name: 'destinations.update', module: 'destinations', description: 'Update destinations' },
      { name: 'destinations.delete', module: 'destinations', description: 'Delete destinations' },
      { name: 'bookings.read', module: 'bookings', description: 'Read bookings' },
      { name: 'bookings.create', module: 'bookings', description: 'Create bookings' },
      { name: 'bookings.update', module: 'bookings', description: 'Update bookings' },
      { name: 'bookings.delete', module: 'bookings', description: 'Delete bookings' },
      { name: 'payments.read', module: 'payments', description: 'Read payments' },
      { name: 'payments.create', module: 'payments', description: 'Create payments' },
      { name: 'reports.read', module: 'reports', description: 'Read reports' },
      { name: 'settings.read', module: 'settings', description: 'Read settings' },
      { name: 'settings.update', module: 'settings', description: 'Update settings' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded permissions:', permissions.count);

  const allPermissions = await prisma.permission.findMany();

  const adminPerms = allPermissions.map((p) => p.id);
  const agentPerms = allPermissions.filter((p) => ['destinations.read', 'destinations.create', 'destinations.update', 'bookings.read', 'bookings.create', 'payments.read', 'reports.read'].includes(p.name)).map((p) => p.id);
  const customerPerms = allPermissions.filter((p) => ['destinations.read', 'bookings.read', 'bookings.create'].includes(p.name)).map((p) => p.id);

  await prisma.rolePermission.createMany({
    data: [
      ...adminPerms.map((permission_id) => ({ role_id: adminRole.id, permission_id })),
      ...agentPerms.map((permission_id) => ({ role_id: agentRole.id, permission_id })),
      ...customerPerms.map((permission_id) => ({ role_id: customerRole.id, permission_id })),
    ],
    skipDuplicates: true,
  });
  console.log('Seeded role permissions');

  const users = [
    await prisma.user.create({
      data: {
        email: 'admin@travel.com',
        password_hash: hashedPassword,
        full_name: 'Admin User',
        phone: '+96812345678',
        is_active: true,
        user_roles: {
          create: [
            { role: { connect: { id: adminRole.id } } },
            { role: { connect: { id: agentRole.id } } },
          ],
        },
      },
    }),
    await prisma.user.create({
      data: {
        email: 'agent@travel.com',
        password_hash: hashedPassword,
        full_name: 'Agent User',
        phone: '+96812345679',
        is_active: true,
        user_roles: {
          create: [
            { role: { connect: { id: agentRole.id } } },
            { role: { connect: { id: customerRole.id } } },
          ],
        },
      },
    }),
    await prisma.user.create({
      data: {
        email: 'customer@travel.com',
        password_hash: hashedPassword,
        full_name: 'Customer User',
        phone: '+96812345680',
        is_active: true,
        user_roles: {
          create: [{ role: { connect: { id: customerRole.id } } }],
        },
      },
    }),
  ];
  console.log('Seeded users:', users.length);

  const destinations = await prisma.destination.createMany({
    data: [
      { name: 'Muscat', country: 'Oman', embassy_city: 'Muscat' },
      { name: 'Salalah', country: 'Oman', embassy_city: 'Salalah' },
      { name: 'Dubai', country: 'UAE', embassy_city: 'Dubai' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded destinations:', destinations.count);

  const allDestinations = await prisma.destination.findMany();

  const airlines = await prisma.airline.createMany({
    data: [
      { name: 'Oman Air', code: 'WY', logo_url: 'https://example.com/oman-air.png' },
      { name: 'Emirates', code: 'EK', logo_url: 'https://example.com/emirates.png' },
      { name: 'Qatar Airways', code: 'QR', logo_url: 'https://example.com/qatar.png' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded airlines:', airlines.count);

  const hotelPartners = await prisma.hotelPartner.createMany({
    data: [
      { name: 'Crowne Plaza Muscat', location: 'Muscat, Oman', rating: '4.5', reviews_count: 120, amenities: { wifi: true, pool: true, spa: true }, email: 'info@cp-muscat.com', phone: '+96824601000', is_active: true },
      { name: 'Al Bustan Palace', location: 'Muscat, Oman', rating: '4.8', reviews_count: 85, amenities: { wifi: true, pool: true, beach: true }, email: 'info@albustan.com', phone: '+96824650000', is_active: true },
      { name: 'Salalah Marriott Resort', location: 'Salalah, Oman', rating: '4.6', reviews_count: 95, amenities: { wifi: true, pool: true, restaurant: true }, email: 'info@salalah-marriott.com', phone: '+96826203000', is_active: true },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded hotel partners:', hotelPartners.count);

  const roomTypes = await prisma.roomType.createMany({
    data: [
      { name: 'Standard Room', description: 'Comfortable standard room with city view', icon: 'single' },
      { name: 'Deluxe Room', description: 'Spacious deluxe room with sea view', icon: 'double' },
      { name: 'Suite', description: 'Luxurious suite with separate living area', icon: 'suite' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded room types:', roomTypes.count);

  const transferTypes = await prisma.transferType.createMany({
    data: [
      { name: 'Airport Transfer', description: 'Transfer from airport to hotel' },
      { name: 'Hotel Transfer', description: 'Transfer between hotels' },
      { name: 'City Tour Transfer', description: 'Transfer for city sightseeing tours' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded transfer types:', transferTypes.count);

  const visaTypes = await prisma.visaType.createMany({
    data: [
      { name: 'Tourist Visa', description: 'Standard tourist visa for short stays' },
      { name: 'Business Visa', description: 'Visa for business purposes' },
      { name: 'Transit Visa', description: 'Visa for transit through the country' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded visa types:', visaTypes.count);

  const packageCategories = await prisma.packageCategory.createMany({
    data: [
      { name: 'Adventure', description: 'Adventure and outdoor packages' },
      { name: 'Luxury', description: 'Luxury travel packages' },
      { name: 'Family', description: 'Family-friendly packages' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded package categories:', packageCategories.count);

  const currencies = await prisma.currency.createMany({
    data: [
      { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', is_active: true },
      { code: 'USD', name: 'US Dollar', symbol: '$', is_active: true },
      { code: 'EUR', name: 'Euro', symbol: '€', is_active: true },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded currencies:', currencies.count);

  const leadSources = await prisma.leadSource.createMany({
    data: [
      { name: 'Website', description: 'Leads from company website' },
      { name: 'Social Media', description: 'Leads from social media platforms' },
      { name: 'Referral', description: 'Leads from customer referrals' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded lead sources:', leadSources.count);

  const insuranceProviders = await prisma.insuranceProvider.createMany({
    data: [
      { name: 'Oman Insurance', contact_email: 'info@omaninsurance.com', contact_phone: '+96824248888', website: 'https://omaninsurance.com' },
      { name: 'AXA Insurance', contact_email: 'info@axa.com', contact_phone: '+96824660000', website: 'https://axa.com' },
      { name: 'Allianz Travel', contact_email: 'info@allianz.com', contact_phone: '+96824880000', website: 'https://allianz.com' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded insurance providers:', insuranceProviders.count);

  const suppliers = await prisma.supplier.createMany({
    data: [
      { name: 'Oman Tours Co', type: 'Tour Operator', contact_person: 'Ahmed Al-Balushi', email: 'info@omantours.com', phone: '+96824123456', country: 'Oman', commission_rate: '10.00', payment_terms: 'Net 30', status: 'active', rating: '4.5' },
      { name: 'Luxury Hotels Group', type: 'Hotel Chain', contact_person: 'Sara Al-Harthy', email: 'info@luxuryhotels.com', phone: '+96824987654', country: 'UAE', commission_rate: '15.00', payment_terms: 'Net 15', status: 'active', rating: '4.8' },
      { name: 'Global Air Services', type: 'Airline', contact_person: 'Mohammed Al-Siyabi', email: 'info@globalair.com', phone: '+96824345678', country: 'Qatar', commission_rate: '8.00', payment_terms: 'Net 30', status: 'active', rating: '4.3' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded suppliers:', suppliers.count);

  const documentCategories = await prisma.documentCategory.createMany({
    data: [
      { name: 'Passport', description: 'Passport copies and documents' },
      { name: 'Visa', description: 'Visa applications and approvals' },
      { name: 'Insurance', description: 'Travel insurance documents' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded document categories:', documentCategories.count);

  const calendarEventTypes = await prisma.calendarEventType.createMany({
    data: [
      { name: 'Meeting', color: '#3B82F6' },
      { name: 'Deadline', color: '#EF4444' },
      { name: 'Holiday', color: '#10B981' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded calendar event types:', calendarEventTypes.count);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
