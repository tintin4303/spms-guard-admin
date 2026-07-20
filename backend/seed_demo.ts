import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.contract.findFirst();
  if (existing) {
    console.log("Contract already exists.");
    return;
  }
  const dummyClient = await prisma.user.create({ data: { name: 'Demo Corporate Client', role: 'CLIENT' }});
  await prisma.contract.create({
    data: {
      clientCompanyName: 'CorpScale Industries (Demo)',
      contactInfo: 'demo@corpscale.io',
      durationMonths: 12,
      clientId: dummyClient.id,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      sites: {
        create: [
          { name: 'Headquarters Perimeter' },
          { name: 'Logistics Warehouse B' }
        ]
      }
    }
  });
  console.log("Demo contract seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
