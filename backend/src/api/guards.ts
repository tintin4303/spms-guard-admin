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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, guardId, certificateNumber, shiftPreference } = req.body;
    
    const updated = await prisma.guard.update({
      where: { id },
      data: {
        firstName,
        lastName,
        guardId,
        certificateNumber,
        shiftPreference
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update guard' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.guard.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete guard' });
  }
});

export default router;
