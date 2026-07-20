import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const guards = await prisma.guard.findMany();
    res.json(guards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guards' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, guardId, certificateNumber, shiftPreference } = req.body;
    const guard = await prisma.guard.create({
      data: {
        firstName,
        lastName,
        guardId,
        certificateNumber,
        shiftPreference
      }
    });
    res.json(guard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create guard' });
  }
});

export default router;
