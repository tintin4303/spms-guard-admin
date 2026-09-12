import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export const getAllUsers = async () => {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, image: true, emailVerified: true } });
}

export const createUser = async (data: any) => {
    const { email, name, role, password } = data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    let extraData: any = {};
    if (role === 'AGENCY_MANAGER') {
       const newAgency = await prisma.agency.create({
         data: { name: name || ('Vendor ' + email.split('@')[0]), contact: email }
       });
       extraData = { managedAgencyId: newAgency.id };
    } else if (role === 'CLIENT') {
       extraData = {
         clientProfile: {
           create: {
             clientType: data.clientType || 'นิติบุคคล',
             taxId: data.taxId,
             registeredNameTh: data.registeredNameTh,
             registeredNameEn: data.registeredNameEn,
             address: data.address,
             contactPerson: data.contactPerson,
             phone: data.phone,
             lineId: data.lineId
           }
         }
       };
    }

    return prisma.user.create({
      data: { email, name, role, password: hashedPassword, ...extraData },
      select: { id: true, name: true, email: true, role: true }
    });
}

export const deleteUser = async (id: string) => {
    await prisma.user.delete({ where: { id } });
}
