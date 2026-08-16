import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data...');
  
  // 1. Create a dummy Agency
  const agency = await prisma.agency.create({
    data: { name: 'Alpha Security Corp', contact: 'alpha@example.com' }
  });

  // 2. Create some Guards
  const guard1 = await prisma.guard.create({
    data: {
      guardId: 'GRD-1042',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      shiftPreference: 'Day',
      agencyId: agency.id,
      status: 'Active',
      contactNumber: '555-0100',
      certificationExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Valid
      skills: JSON.stringify(['First Aid', 'CCTV'])
    }
  });

  const guard2 = await prisma.guard.create({
    data: {
      guardId: 'GRD-9021',
      firstName: 'Marcus',
      lastName: 'Thorne',
      shiftPreference: 'Night',
      agencyId: agency.id,
      status: 'Active',
      contactNumber: '555-0101',
      certificationExpiry: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Expired
      skills: JSON.stringify(['Armed', 'First Aid'])
    }
  });

  // 3. Create Users (Client, Admin, Ops Manager)
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password', 10);

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      password: hashedPassword,
      name: 'Acme Corp Admin',
      role: 'CLIENT'
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@spms.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN'
    }
  });

  const opsUser = await prisma.user.create({
    data: {
      email: 'ops@spms.com',
      password: hashedPassword,
      name: 'Operations Manager',
      role: 'OPERATION_MANAGER'
    }
  });

  // 4. Create a Contract and Site
  const contract = await prisma.contract.create({
    data: {
      clientCompanyName: 'Acme Corp',
      contactInfo: 'acme@example.com',
      durationMonths: 12,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      clientId: clientUser.id,
      sites: {
        create: [
          {
            name: 'Corporate Campus - Gate A',
            shiftCount: 2,
            shiftTimings: ['08:00 - 20:00', '20:00 - 08:00']
          },
          {
            name: 'Logistics Hub - Main',
            shiftCount: 2,
            shiftTimings: ['08:00 - 20:00', '20:00 - 08:00']
          }
        ]
      }
    },
    include: { sites: true }
  });

  const siteA = contract.sites[0];

  // 5. Create Schedules (Guard Assignments)
  const today = new Date();
  
  await prisma.guardAssignment.create({
    data: {
      shiftLabel: 'Today, 08:00 - 20:00',
      date: today,
      startTime: '08:00',
      endTime: '20:00',
      status: 'Scheduled',
      guardId: guard1.id,
      siteId: siteA.id
    }
  });

  await prisma.guardAssignment.create({
    data: {
      shiftLabel: 'Today, 20:00 - 08:00',
      date: today,
      startTime: '20:00',
      endTime: '08:00',
      status: 'Scheduled',
      guardId: guard2.id,
      siteId: siteA.id
    }
  });

  // 6. Create a Patrol Path and MapPin for Logs
  const path = await prisma.patrolPath.create({
    data: {
      name: 'Perimeter Check',
      siteId: siteA.id,
      pins: {
        create: [
          { name: 'Loading Dock', latitude: 0, longitude: 0, orderIndex: 1 }
        ]
      }
    },
    include: { pins: true }
  });

  // 7. Create Logs
  await prisma.operationLog.create({
    data: {
      isIncident: false,
      description: 'Completed perimeter sweep. All clear.',
      guardId: guard1.id,
      mapPinId: path.pins[0].id
    }
  });

  await prisma.operationLog.create({
    data: {
      isIncident: true,
      description: 'Unauthorized vehicle near loading dock. Requested departure.',
      guardId: guard2.id,
      mapPinId: path.pins[0].id
    }
  });

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
