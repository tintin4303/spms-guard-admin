"use server"

import { auth } from "@/auth"
import { canManageUsers } from "@/lib/permissions"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function getUsers() {
  const session = await auth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!canManageUsers((session?.user as any)?.role)) {
    throw new Error("Unauthorized")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return users
}

export async function createUser(formData: FormData) {
  const session = await auth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!canManageUsers((session?.user as any)?.role)) {
    throw new Error("Unauthorized")
  }

  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string

  if (!email || !role || !password) {
    throw new Error("Missing required fields")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      role,
      passwordHash,
      isActive: true,
    }
  })

  revalidatePath("/dashboard/users")
}
