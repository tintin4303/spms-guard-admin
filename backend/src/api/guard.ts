import express from 'express';
import { requireRole } from '../middleware/roleCheck';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get Guard Profile
const getGuardProfile = async (userId: string) => {
  return await prisma.guard.findUnique({
    where: { userId }
  });
};

// Get today's and upcoming shifts
router.get('/shifts', requireRole(['GUARD']), async (req: AuthRequest, res) => {
  try {
    const guard = await getGuardProfile(req.user!.userId);
    if (!guard) return res.status(404).json({ error: 'Guard profile not found' });

    const shifts = await prisma.siteRoster.findMany({
      where: { guardId: guard.id },
      include: {
        site: {
          include: {
            contract: true,
            patrolPaths: { include: { pins: true } }
          }
        },
        logs: true // To show progress
      },
      orderBy: { date: 'desc' }
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

// Submit a checkin for a specific map pin during a shift
router.post('/shifts/:rosterId/checkin', requireRole(['GUARD']), async (req: AuthRequest, res) => {
  try {
    const guard = await getGuardProfile(req.user!.userId);
    if (!guard) return res.status(404).json({ error: 'Guard profile not found' });

    const rosterId = req.params.rosterId as string;
    const { mapPinId, description } = req.body;

    const log = await prisma.operationLog.create({
      data: {
        isIncident: false,
        description,
        guardId: guard.id,
        mapPinId,
        rosterId
      }
    });

    // Check if all pins are checked in
    const roster: any = await prisma.siteRoster.findUnique({
      where: { id: rosterId },
      include: { 
        site: { include: { patrolPaths: { include: { pins: true } } } },
        logs: { where: { isIncident: false } }
      }
    });

    if (roster) {
      // Collect all pin IDs from all paths for this site
      const allPins = new Set<string>();
      roster.site.patrolPaths.forEach((path: any) => path.pins.forEach((p: any) => allPins.add(p.id)));
      
      const checkedInPins = new Set(roster.logs.map((l: any) => l.mapPinId));
      checkedInPins.add(mapPinId);

      let isComplete = true;
      allPins.forEach(pId => {
        if (!checkedInPins.has(pId)) isComplete = false;
      });

      if (isComplete && roster.status !== 'Completed') {
        await prisma.siteRoster.update({
          where: { id: rosterId },
          data: { status: 'Completed' }
        });
      }
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Manually complete a shift (with condition/notes)
router.post('/shifts/:rosterId/complete', requireRole(['GUARD']), async (req: AuthRequest, res) => {
  try {
    const rosterId = req.params.rosterId as string;
    const { notes } = req.body;
    
    const roster = await prisma.siteRoster.update({
      where: { id: rosterId },
      data: { status: notes ? `Completed (Condition: ${notes})` : 'Completed' }
    });

    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete shift' });
  }
});

// Report an incident
router.post('/incidents', requireRole(['GUARD']), async (req: AuthRequest, res) => {
  try {
    const guard = await getGuardProfile(req.user!.userId);
    if (!guard) return res.status(404).json({ error: 'Guard profile not found' });

    const { mapPinId, rosterId, description } = req.body;

    const incident = await prisma.operationLog.create({
      data: {
        isIncident: true,
        description,
        guardId: guard.id,
        mapPinId,
        rosterId
      }
    });

    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to report incident' });
  }
});

// Get metrics
router.get('/metrics', requireRole(['GUARD']), async (req: AuthRequest, res) => {
  try {
    const guard = await getGuardProfile(req.user!.userId);
    if (!guard) return res.status(404).json({ error: 'Guard profile not found' });

    const completedShifts = await prisma.siteRoster.count({
      where: { guardId: guard.id, status: { startsWith: 'Completed' } }
    });

    const totalHours = completedShifts * 12; 

    const incidentsReported = await prisma.operationLog.count({
      where: { guardId: guard.id, isIncident: true }
    });

    res.json({
      completedShifts,
      totalHours,
      incidentsReported
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
