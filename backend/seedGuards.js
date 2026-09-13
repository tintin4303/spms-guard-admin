const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock block...');
  
  const agency = await prisma.agency.create({
    data: {
      name: 'Sentinel Security Group',
      contact: '555-800-1111'
    }
  });

  const names = ['Michael Jenkins', 'Sarah Vance', 'Robert Caldwell', 'Timothy Drake', 'Alice Zheng', 'James Hawkins', 'Elizabeth Stone', 'Daniel Craig', 'Chris Norton', 'Angela Yu'];
  
  for (let i = 0; i < names.length; i++) {
    const [first, ...lastArr] = names[i].split(' ');
    const last = lastArr.join(' ');
    await prisma.guard.create({
      data: {
        guardId: `GRD-8${Math.floor(Math.random() * 9000) + 1000}`,
        firstName: first,
        lastName: last,
        status: 'Active',
        agencyId: agency.id,
        isVisibleToOps: true,
        source: 'AGENCY',
        shiftPreference: i % 2 === 0 ? 'Day' : 'Night'
      }
    });
  }

  console.log('Successfully added mock guards and agency.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});