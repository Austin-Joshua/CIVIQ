import prisma from './lib/prisma.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting city data seed...');

  // Create demo admin
  const adminEmail = 'admin@civiq.city';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('civiq2026', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'CIVIQ Administrator',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created (admin@civiq.city / civiq2026)');
  }

  // Create Zones
  const zones = ['Zone A - Central', 'Zone B - Port Side', 'Zone C - Industrial', 'Zone D - Residential North'];
  const createdZones = [];

  for (const name of zones) {
    const zone = await prisma.zone.create({
      data: {
        name,
        cleanlinessScore: Math.floor(Math.random() * 40) + 60,
        geometry: JSON.stringify({ type: 'Polygon', coordinates: [] })
      }
    });
    createdZones.push(zone);
    console.log(`✅ Zone created: ${name}`);
  }

  // Create Bins
  for (const zone of createdZones) {
    for (let i = 0; i < 5; i++) {
      await prisma.bin.create({
        data: {
          locationLat: 40.7128 + (Math.random() - 0.5) * 0.05,
          locationLng: -74.0060 + (Math.random() - 0.5) * 0.05,
          capacity: 1000,
          currentFillLevel: Math.floor(Math.random() * 100),
          type: i % 2 === 0 ? 'GENERAL' : 'RECYCLING',
          zoneId: zone.id
        }
      });
    }
    console.log(`✅ 5 Bins created for ${zone.name}`);
  }

  // Create Vehicles
  const statuses = ['IDLE', 'ON_ROUTE', 'MAINTENANCE'];
  for (let i = 1; i <= 5; i++) {
    await prisma.vehicle.create({
      data: {
        id: `V-0${i}`,
        capacity: 15.5,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lat: 40.7128 + (Math.random() - 0.5) * 0.02,
        lng: -74.0060 + (Math.random() - 0.5) * 0.02,
      }
    });
    console.log(`✅ Vehicle V-0${i} created`);
  }

  console.log('🏁 Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
