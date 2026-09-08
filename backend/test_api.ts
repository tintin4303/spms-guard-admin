import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'guard@spms.com' } });
  if (!user) throw new Error('User not found');
  
  const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '1d' }
  );
  console.log('TOKEN:', token);
  
  const res = await fetch('http://localhost:3001/api/guard/shifts', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('STATUS:', res.status);
  const data = await res.json();
  console.log('DATA:', JSON.stringify(data, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
