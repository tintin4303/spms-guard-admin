import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log("Email:", user.email);
    console.log("Password:", user.password);
    const matches1 = await bcrypt.compare('password123', user.password || '');
    console.log("Matches password123?", matches1);
    const matches2 = await bcrypt.compare('default_password', user.password || '');
    console.log("Matches default_password?", matches2);
  } else {
    console.log("No users found");
  }
}
check().catch(console.error).finally(() => prisma.$disconnect());
