import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const logs = await prisma.operationLog.findMany({
      include: {
        guard: true,
        mapPin: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { isIncident, description, guardId, mapPinId } = req.body;
    const log = await prisma.operationLog.create({
      data: {
        isIncident: isIncident || false,
        description,
        guardId,
        mapPinId
      },
      include: {
        guard: true,
        mapPin: true
      }
    });
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

export default router;
