import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@spms.com"
  const password = "password123"

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  })

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10)
    
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      }
    })
    
    console.log(`Created admin user: ${email}`)
  } else {
    console.log(`Admin user ${email} already exists.`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
