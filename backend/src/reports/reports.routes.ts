import { Router } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const router = Router();
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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    if (user?.role === 'AGENCY_MANAGER') {
      guardFilter.agencyId = user.managedAgencyId;
      siteFilter.rosters = { some: { guard: { agencyId: user.managedAgencyId } } };
    } else if (user?.role === 'CLIENT') {
      siteFilter.contract = { clientId: user.userId };
      guardFilter.rosters = { some: { site: { contract: { clientId: user.userId } } } };
    }

    const totalGuardsCount = await prisma.guard.count({ where: guardFilter });
    
    const rosterFilter = user?.role === 'CLIENT' ? { site: { contract: { clientId: user.userId } } } : (user?.role === 'AGENCY_MANAGER' ? { guard: { agencyId: user.managedAgencyId } } : {});
    const guardsOnDuty = await prisma.siteRoster.findMany({
      where: rosterFilter,
      distinct: ['guardId'],
      select: { guardId: true }
    });

    const baseAlertsCondition: any = { isIncident: true };
    if (user?.role === 'AGENCY_MANAGER') baseAlertsCondition.guard = { agencyId: user.managedAgencyId };
    if (user?.role === 'CLIENT') baseAlertsCondition.mapPin = { patrolPath: { site: { contract: { clientId: user.userId } } } };

    const pendingAlerts = await prisma.operationLog.count({ where: { ...baseAlertsCondition, resolved: false } });

    const recentIncidents = await prisma.operationLog.findMany({
      where: { ...baseAlertsCondition, timestamp: { gte: thirtyDaysAgo } },
      include: {
        mapPin: { include: { patrolPath: { include: { site: true } } } }
      }
    });

    const incidentFrequency = recentIncidents.reduce((acc: any, inc) => {
      const sName = inc.mapPin?.patrolPath?.site?.name || 'Unknown';
      acc[sName] = (acc[sName] || 0) + 1;
      return acc;
    }, {});

    // Calculate real attendance, punctuality, and site breakdowns using ArrivalLogs
    const allRecentShifts = await prisma.siteRoster.findMany({
      where: { ...rosterFilter, date: { gte: thirtyDaysAgo } },
      include: {
        site: true,
        arrivals: true
      } as any
    });
    
    const totalShifts = allRecentShifts.length;
    const completedShifts = allRecentShifts.filter(s => s.status.startsWith('Completed') || s.status === 'In Progress').length;
    const attendanceRate = totalShifts > 0 ? parseFloat(((completedShifts / totalShifts) * 100).toFixed(1)) : 0;

    const exceptionCount = await prisma.shiftException.count({
      where: { roster: rosterFilter, date: { gte: thirtyDaysAgo } }
    });
    const contractFulfillment = totalShifts > 0 ? parseFloat((((totalShifts - exceptionCount) / totalShifts) * 100).toFixed(1)) : 100;

    // Site Attendance & Punctuality Breakdown
    const siteAttendanceMap: Record<string, { onTime: number; late: number; absent: number }> = {};
    let totalOnTime = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    allRecentShifts.forEach((shift: any) => {
      const siteName = shift.site?.name || 'Unassigned Site';
      if (!siteAttendanceMap[siteName]) {
        siteAttendanceMap[siteName] = { onTime: 0, late: 0, absent: 0 };
      }

      if (shift.arrivals && shift.arrivals.length > 0) {
        const arrival = shift.arrivals[0];
        if (arrival.status === 'On Time') {
          siteAttendanceMap[siteName].onTime += 1;
          totalOnTime += 1;
        } else {
          siteAttendanceMap[siteName].late += 1;
          totalLate += 1;
        }
      } else if (shift.status === 'Scheduled' && shift.date && new Date(shift.date).getTime() < Date.now()) {
        siteAttendanceMap[siteName].absent += 1;
        totalAbsent += 1;
      } else if (shift.status.startsWith('Completed')) {
        siteAttendanceMap[siteName].onTime += 1;
        totalOnTime += 1;
      }
    });

    const siteAttendanceData = Object.keys(siteAttendanceMap).map(site => ({
      site,
      onTime: siteAttendanceMap[site].onTime,
      late: siteAttendanceMap[site].late,
      absent: siteAttendanceMap[site].absent
    }));

    // Overall Punctuality Summary
    const punctualitySummary = {
      onTime: totalOnTime,
      late: totalLate,
      absent: totalAbsent,
      onTimeRate: (totalOnTime + totalLate) > 0 ? parseFloat(((totalOnTime / (totalOnTime + totalLate)) * 100).toFixed(1)) : 100
    };

    res.json({
      activeContracts: await prisma.contract.count({ where: user?.role === 'CLIENT' ? { clientId: user.userId } : {} }),
      guardsOnDuty: guardsOnDuty.length,
      totalGuardsCount,
      pendingAlerts,
      attendanceRate,
      contractFulfillment,
      siteAttendanceData,
      punctualitySummary,
      incidentFrequency
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

    const { startDate, endDate, siteId } = req.query;

    // Default to Current Month start and end if not explicitly specified to prevent system lag
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startObj = startDate ? new Date(String(startDate)) : currentMonthStart;
    const endObj = endDate ? new Date(String(endDate)) : currentMonthEnd;

    const rosterWhere: any = { date: { gte: startObj, lte: endObj } };
    if (siteId) rosterWhere.siteId = String(siteId);

    const guards = await prisma.guard.findMany({
      where: filter,
      include: {
        agency: true,
        rosters: {
          where: rosterWhere,
          include: { 
            site: { include: { contract: true } },
            arrivals: true,
            exceptions: true
          }
        },
        checkIns: {
          where: { isIncident: true, timestamp: { gte: startObj, lte: endObj } }
        }
      }
    });

    const mapped = guards.map((g: any) => {
      const totalAssigned = g.rosters.length;
      const completedShifts = g.rosters.filter((r: any) => r.status.startsWith('Completed')).length;

      let totalAssignedHours = 0;
      let lateDeductionMinutes = 0;

      g.rosters.forEach((r: any) => {
        const [sh, sm] = (r.startTime || '08:00').split(':').map(Number);
        const [eh, em] = (r.endTime || '20:00').split(':').map(Number);
        let diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff <= 0) diff += 24 * 60; // overnight shift
        totalAssignedHours += diff / 60;
      });

      // Tiered Late Penalties & Arrival Tracking
      let arrivedCount = 0;
      let onTimeCount = 0;
      let minorLateCount = 0;    // 1 - 15 mins
      let moderateLateCount = 0; // 16 - 45 mins
      let severeLateCount = 0;   // > 45 mins

      g.rosters.forEach((r: any) => {
        if (r.arrivals && r.arrivals.length > 0) {
          arrivedCount++;
          const arrival = r.arrivals[0];
          if (r.date) {
            const shiftDate = new Date(r.date);
            const [hrs, mins] = (r.startTime || '08:00').split(':').map(Number);
            const shiftStart = new Date(shiftDate);
            shiftStart.setHours(hrs, mins, 0, 0);

            const diffMs = new Date(arrival.timestamp).getTime() - shiftStart.getTime();
            const diffMins = Math.floor(diffMs / (60 * 1000));

            if (diffMins <= 10) {
              onTimeCount++;
            } else {
              lateDeductionMinutes += Math.max(0, diffMins);
              if (diffMins <= 15) {
                minorLateCount++;
              } else if (diffMins <= 45) {
                moderateLateCount++;
              } else {
                severeLateCount++;
              }
            }
          } else {
            onTimeCount++;
          }
        }
      });

      const totalLateCount = minorLateCount + moderateLateCount + severeLateCount;
      const exceptionCount = g.rosters.reduce((sum: number, r: any) => sum + (r.exceptions?.length || 0), 0);
      const noShowCount = Math.max(0, totalAssigned - arrivedCount - exceptionCount);
      const absenceCount = exceptionCount + noShowCount;

      // Calculate Worked Hours = Completed Shift Hours - Late Deductions - Absence Hours
      let workedHours = Math.max(0, totalAssignedHours - (noShowCount * 12) - (lateDeductionMinutes / 60));
      workedHours = Math.round(workedHours * 10) / 10;
      totalAssignedHours = Math.round(totalAssignedHours * 10) / 10;

      const attendanceRate = totalAssigned > 0 ? Math.round(((arrivedCount) / totalAssigned) * 100) : 0;

      // Distinct contracts and sites covered
      const assignedContracts = [...new Set(g.rosters.map((r: any) => r.site?.contract?.clientCompanyName || r.site?.name).filter(Boolean))].length;
      const siteNames = [...new Set(g.rosters.map((r: any) => r.site?.name).filter(Boolean))];
      const avgIncidentsPerShift = completedShifts > 0 ? Math.round((g.checkIns.length / completedShifts) * 100) / 100 : 0;

      return {
        id: g.id,
        guardId: g.guardId,
        firstName: g.firstName,
        lastName: g.lastName,
        source: g.source,
        status: g.status,
        shiftPreference: g.shiftPreference || 'Flexible',
        agency: g.agency,
        // Enriched performance metrics
        assignedContracts,
        totalAssigned,
        completedShifts,
        totalAssignedHours,
        workedHours,
        attendanceRate,
        onTimeCount,
        lateCount: totalLateCount,
        minorLateCount,
        moderateLateCount,
        severeLateCount,
        noShowCount,
        exceptionCount,
        absenceCount,
        sitesCovered: siteNames.join(', '),
        incidentCount: g.checkIns.length,
        avgIncidentsPerShift
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch guard reports' });
  }
});

export default router;
