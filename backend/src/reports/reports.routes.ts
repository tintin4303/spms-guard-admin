import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Middleware to extract user from JWT
router.use((req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch (e) {}
  }
  next();
});

router.get('/overview', async (req: any, res) => {
  try {
    const user = req.user;

    // Filters based on role
    const siteFilter: any = {};
    const guardFilter: any = {};
    
    if (user?.role === 'AGENCY_MANAGER') {
      guardFilter.agencyId = user.managedAgencyId;
      siteFilter.rosters = { some: { guard: { agencyId: user.managedAgencyId } } };
    } else if (user?.role === 'CLIENT') {
      siteFilter.contract = { clientId: user.userId };
      guardFilter.rosters = { some: { site: { contract: { clientId: user.userId } } } };
    }

    const totalGuardsCount = await prisma.guard.count({ where: guardFilter });
    
    const guardsOnDuty = await prisma.siteRoster.findMany({
      where: user?.role === 'CLIENT' ? { site: { contract: { clientId: user.userId } } } : (user?.role === 'AGENCY_MANAGER' ? { guard: { agencyId: user.managedAgencyId } } : {}),
      distinct: ['guardId'],
      select: { guardId: true }
    });

    const pendingAlertsCondition: any = { isIncident: true, resolved: false };
    if (user?.role === 'AGENCY_MANAGER') pendingAlertsCondition.guard = { agencyId: user.managedAgencyId };
    if (user?.role === 'CLIENT') pendingAlertsCondition.mapPin = { patrolPath: { site: { contract: { clientId: user.userId } } } };

    const pendingAlerts = await prisma.operationLog.count({ where: pendingAlertsCondition });

    const recentIncidentsCond = { isIncident: true, timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    if (user?.role === 'AGENCY_MANAGER') (recentIncidentsCond as any).guard = { agencyId: user.managedAgencyId };
    if (user?.role === 'CLIENT') (recentIncidentsCond as any).mapPin = { patrolPath: { site: { contract: { clientId: user.userId } } } };

    const recentIncidents = await prisma.operationLog.findMany({
      where: recentIncidentsCond,
      include: {
        mapPin: { include: { patrolPath: { include: { site: true } } } }
      }
    });

    const incidentFrequency = recentIncidents.reduce((acc: any, inc) => {
      const sName = inc.mapPin?.patrolPath?.site?.name || 'Unknown';
      acc[sName] = (acc[sName] || 0) + 1;
      return acc;
    }, {});


    res.json({
      activeContracts: await prisma.contract.count({ where: user?.role === 'CLIENT' ? { clientId: user.userId } : {} }),
      guardsOnDuty: guardsOnDuty.length,
      totalGuardsCount,
      pendingAlerts,
      attendanceRate: guardsOnDuty.length > 0 ? 98.5 : 0, // Fallback placeholder logic
      contractFulfillment: 100,
      incidentFrequency,
      resolutionTimes: {
        critical: 12,
        warning: 45,
        routine: 120
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports overview' });
  }
});

router.get('/guards', async (req: any, res) => {
  try {
    const user = req.user;
    const filter: any = {};
    if (user?.role === 'AGENCY_MANAGER') filter.agencyId = user.managedAgencyId;
    if (user?.role === 'CLIENT') filter.rosters = { some: { site: { contract: { clientId: user.userId } } } };

    const guards = await prisma.guard.findMany({
      where: filter,
      include: {
        agency: true,
        rosters: {
          include: { site: true }
        },
        checkIns: {
          where: { isIncident: true }
        }
      }
    });

    const mapped = guards.map(g => ({
      ...g,
      incidentCount: g.checkIns.length,
      utilization: g.rosters.length > 0 ? 80 : 0, // Fallback
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch guard reports' });
  }
});

export default router;
