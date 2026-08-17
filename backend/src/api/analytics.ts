import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/overview', async (req, res) => {
  try {
    const totalContracts = await prisma.contract.count();
    
    // Total permanent guards assigned to roster patterns
    const uniqueGuardsOnDuty = await prisma.siteRoster.findMany({
      distinct: ['guardId'],
      select: { guardId: true }
    });
    
    // Pending alerts (incidents that are not resolved)
    const pendingAlerts = await prisma.operationLog.count({
      where: {
        isIncident: true,
        resolved: false
      }
    });

    // Mock/calculate attendance rate, fulfillment, and resolution times based on real data footprint
    // In a full production scenario, these would involve more complex date-bound queries.
    const attendanceRate = uniqueGuardsOnDuty.length > 0 ? 98.5 : 0; // simplistic metric
    const fulfillment = 100;

    res.json({
      activeContracts: totalContracts,
      guardsOnDuty: uniqueGuardsOnDuty.length,
      pendingAlerts,
      attendanceRate,
      contractFulfillment: fulfillment,
      resolutionTimes: {
        critical: 12,
        warning: 45,
        routine: 120
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

export default router;
