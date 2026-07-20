import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user account
router.post('/', async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const user = await prisma.user.create({
      data: { email, name, role }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to provision user accounting' });
  }
});

// Remove a user account
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

export default router;
