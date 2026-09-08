import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'GUARD' } });
  console.log('Guard Users:', users);

  const guards = await prisma.guard.findMany();
  console.log('Guards:', guards);

  const rosters = await prisma.siteRoster.findMany();
  console.log('Rosters:', rosters);
}

main().catch(console.error).finally(() => prisma.$disconnect());
