import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

router.get('/attendance', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user: any = null;
    if (token) {
      try { user = jwt.verify(token, JWT_SECRET); } catch (e) {}
    }

    const where: any = {};
    if (user?.role === 'CLIENT') {
      where.roster = { site: { contract: { clientId: user.userId } } };
    } else if (user?.role === 'AGENCY_MANAGER') {
      where.guard = { agencyId: user.managedAgencyId };
    }

    const arrivals = await (prisma as any).arrivalLog.findMany({
      where,
      include: {
        guard: { include: { agency: true } },
        roster: { include: { site: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    const formattedArrivals = arrivals.map((a: any) => {
      let computedStatus = a.status;
      if (!computedStatus && a.roster?.startTime) {
        const arrivalDate = new Date(a.timestamp);
        const [shiftHour, shiftMin] = a.roster.startTime.split(':').map(Number);
        const expectedTime = new Date(arrivalDate);
        expectedTime.setHours(shiftHour, shiftMin, 0, 0);
        
        // Late if arrived > 10 minutes after scheduled shift start
        const diffMinutes = (arrivalDate.getTime() - expectedTime.getTime()) / (1000 * 60);
        computedStatus = diffMinutes > 10 ? 'Late' : 'On Time';
      }
      return {
        ...a,
        status: computedStatus || 'On Time'
      };
    });

    res.json(formattedArrivals);
  } catch (err) {
    console.error('Error fetching attendance logs:', err);
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user: any = null;
    if (token) {
      try { user = jwt.verify(token, JWT_SECRET); } catch (e) {}
    }

    const where: any = {};
    if (user?.role === 'CLIENT') {
      where.mapPin = { patrolPath: { site: { contract: { clientId: user.userId } } } };
      where.resolved = true; // Use resolved flag as a proxy for "approved/published"
    } else if (user?.role === 'AGENCY_MANAGER') {
      where.guard = { agencyId: user.managedAgencyId };
    }

    const logs = await prisma.operationLog.findMany({
      where,
      include: {
        guard: true,
        mapPin: {
          include: {
            patrolPath: {
              include: {
                site: true
              }
            }
          }
        }
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

router.put('/:id/resolve', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user: any = null;
    if (token) {
      try { user = jwt.verify(token, JWT_SECRET); } catch (e) {}
    }
    
    if (user?.role !== 'OPERATION_MANAGER') {
      return res.status(403).json({ error: 'Only Operations Managers can resolve incidents' });
    }

    const { resolutionNote } = req.body;
    const log = await prisma.operationLog.update({
      where: { id: req.params.id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedById: user.userId,
        resolutionNote
      },
      include: {
        resolvedBy: true
      }
    });
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve log' });
  }
});

export default router;
