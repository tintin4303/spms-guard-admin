import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = Router();
const prisma = new PrismaClient();

// Protect all user routes
router.use(authenticateToken);

// Get all users (Admin and Operation Manager)
router.get('/', requireRole(['ADMIN', 'OPERATION_MANAGER']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, image: true, emailVerified: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user account (Admin only)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    
    if (!email || !password || !role) {
      res.status(400).json({ error: 'Email, password, and role are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let agencyOptions: any = {};
    if (role === 'AGENCY_MANAGER') {
       const newAgency = await prisma.agency.create({
         data: { name: name || ('Vendor ' + email.split('@')[0]), contact: email }
       });
       agencyOptions = { managedAgencyId: newAgency.id };
    }

    const user = await prisma.user.create({
      data: { 
        email, 
        name, 
        role,
        password: hashedPassword,
        ...agencyOptions
      },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to provision user account' });
  }
});

// Remove a user account (Admin only)
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: String(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

export default router;
