import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/paths', async (req, res) => {
  try {
    const { siteId } = req.query;
    const whereClause = siteId ? { siteId: String(siteId) } : {};
    const paths = await prisma.patrolPath.findMany({ where: whereClause, include: { pins: true } });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paths' });
  }
});

router.post('/paths', async (req, res) => {
  try {
    const { name, siteId, pins } = req.body;
    
    const newPath = await prisma.patrolPath.create({
      data: {
        name,
        siteId,

        pins: {
          create: pins.map((p: any, idx: number) => ({
             name: p.name,
             latitude: p.lat,
             longitude: p.lng,
             orderIndex: idx
          }))
        }
      },
      include: { pins: true }
    });

    res.json(newPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save patrol path' });
  }
});

router.put('/paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pins } = req.body;
    
    // Clear out old pins and spawn new ones under the same path wrapper
    await prisma.mapPin.deleteMany({ where: { patrolPathId: id } });
    
    const updated = await prisma.patrolPath.update({
      where: { id },
      data: {
        pins: {
          create: pins.map((p: any, idx: number) => ({
             name: p.name,
             latitude: p.lat ?? p.latitude,
             longitude: p.lng ?? p.longitude,
             orderIndex: idx
          }))
        }
      },
      include: { pins: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/paths/:id', async (req, res) => {
  try {
    await prisma.patrolPath.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
