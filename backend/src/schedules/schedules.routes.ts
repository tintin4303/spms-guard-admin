import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user: any = null;
    if (token) {
      try { user = jwt.verify(token, JWT_SECRET); } catch (e) { }
    }

    const { siteId, agencyId, startDate, endDate, isUnassigned } = req.query;
    
    let guardWhere: any = agencyId ? { agencyId: String(agencyId) } : {};
    let siteWhere: any = siteId ? { id: String(siteId) } : {};

    if (user?.role === 'AGENCY_MANAGER') {
       guardWhere = { ...guardWhere, agencyId: user.managedAgencyId };
    }
    if (user?.role === 'CLIENT') {
       siteWhere = { ...siteWhere, contract: { clientId: user.userId } };
    }

    // Default to Current Month if no date filters passed to prevent system lag across all roles
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startObj = startDate ? new Date(String(startDate)) : currentMonthStart;
    const endObj = endDate ? new Date(String(endDate)) : currentMonthEnd;

    const whereClause: any = {
      site: { ...siteWhere },
      date: { gte: startObj, lte: endObj }
    };

    if (String(isUnassigned) === 'true') {
      whereClause.guardId = null;
    } else {
      if (Object.keys(guardWhere).length > 0) {
         whereClause.guard = guardWhere;
      }
    }

    const rosters = await (prisma as any).siteRoster.findMany({
      where: whereClause,
      include: {
        guard: true,
        patrolPath: {
          include: { pins: true }
        },
        site: {
          include: { contract: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    const schedules = rosters.map((r: any) => ({
      id: r.id,
      rosterId: r.id,
      date: r.date ? r.date.toISOString() : null,
      startTime: r.startTime,
      endTime: r.endTime,
      shiftLabel: r.shiftLabel || `${r.date ? r.date.toISOString().split('T')[0] : 'N/A'}, ${r.startTime} - ${r.endTime}`,
      guardId: r.guardId,
      guard: r.guard || null,
      siteId: r.siteId || r.site?.id,
      site: r.site,
      patrolPathId: r.patrolPathId,
      patrolPath: r.patrolPath,
      status: !r.guardId ? 'Unassigned' : (r.status || 'Scheduled')
    }));
    
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId, targetYear, targetMonth, startDate: reqStartDate, endDate: reqEndDate } = req.body;
    
    let startDate: Date;
    let endDate: Date;

    if (reqStartDate && reqEndDate) {
      startDate = new Date(reqStartDate);
      endDate = new Date(reqEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (targetYear && targetMonth) {
      startDate = new Date(Number(targetYear), Number(targetMonth) - 1, 1);
      endDate = new Date(Number(targetYear), Number(targetMonth), 0);
    } else {
      res.status(400).json({ error: 'Either (startDate and endDate) or (targetYear and targetMonth) are required' });
      return;
    }

    // If siteId provided, generate for single site; otherwise generate for all contract sites
    const siteQuery: any = siteId ? { id: String(siteId) } : {};
    const sites = await prisma.site.findMany({
      where: siteQuery,
      include: { contract: true }
    });

    if (sites.length === 0) {
      res.status(404).json({ error: 'No contract sites found to generate slots for.' });
      return;
    }

    let totalInserted = 0;

    for (const site of sites) {
      if (!site.contract) continue;

      let effectiveStart = new Date(startDate);
      let effectiveEnd = new Date(endDate);

      const contractEnd = new Date(site.contract.endDate);
      if (contractEnd < effectiveStart) continue;
      if (contractEnd < effectiveEnd) {
        effectiveEnd = contractEnd;
      }

      let shiftTemplates: any[] = [];
      const requiredShiftCount = site.shiftCount || 2;
      if (site.shiftTimings && Array.isArray(site.shiftTimings) && site.shiftTimings.length >= requiredShiftCount) {
        shiftTemplates = site.shiftTimings;
      } else {
        if (requiredShiftCount === 3) {
          shiftTemplates = [
            { start: "00:00", end: "08:00", label: "Morning Shift (00:00 - 08:00)" },
            { start: "08:00", end: "16:00", label: "Afternoon Shift (08:00 - 16:00)" },
            { start: "16:00", end: "00:00", label: "Night Shift (16:00 - 00:00)" }
          ];
        } else {
          // Default 2 Shifts: Day Shift & Night Shift
          shiftTemplates = [
            { start: "08:00", end: "20:00", label: "Day Shift (08:00 - 20:00)" },
            { start: "20:00", end: "08:00", label: "Night Shift (20:00 - 08:00)" }
          ];
        }
      }

      let currentDate = new Date(effectiveStart);
      while (currentDate <= effectiveEnd) {
        const dateLimit = new Date(currentDate);
        
        for (const t of shiftTemplates) {
          const tStart = typeof t === 'string' ? t.split(' - ')[0] : (t.start || t.startTime || '08:00');
          const tEnd = typeof t === 'string' ? t.split(' - ')[1] : (t.end || t.endTime || '20:00');
          const tLabel = typeof t === 'string' ? t : (t.label || t.name || 'Shift');

          const neededGuards = Math.max(1, site.guardsPerShift || 1);
          const existingCount = await (prisma as any).siteRoster.count({
            where: { siteId: site.id, date: dateLimit, startTime: tStart }
          });

          for (let gIdx = 0; gIdx < neededGuards; gIdx++) {
            const postLabel = neededGuards > 1 ? `${tLabel} (Post ${gIdx + 1})` : tLabel;
            
            // Absolute Idempotency Check: Prevent duplicate slot insertion if slot already exists
            const exists = await (prisma as any).siteRoster.findFirst({
              where: {
                siteId: site.id,
                date: dateLimit,
                startTime: tStart,
                shiftLabel: postLabel
              }
            });

            if (!exists) {
              await (prisma as any).siteRoster.create({
                data: {
                  siteId: site.id,
                  date: dateLimit,
                  shiftLabel: postLabel,
                  startTime: tStart,
                  endTime: tEnd,
                  status: 'Scheduled'
                }
              });
              totalInserted++;
            }
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    res.json({ success: true, inserted: totalInserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate slots' });
  }
});

router.post('/auto-schedule-preview', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId, startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 180 * 86400000);
    end.setHours(23, 59, 59, 999);

    const safeIsoDate = (d: any): string | null => {
      if (!d) return null;
      try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        return dt.toISOString().split('T')[0];
      } catch {
        return null;
      }
    };

    const where: any = {
      date: { gte: start, lte: end },
      OR: [
        { guardId: null },
        { guardId: '' },
        { status: 'Unassigned' }
      ]
    };
    if (siteId) where.siteId = String(siteId);

    let unassignedRosters = await (prisma as any).siteRoster.findMany({
      where,
      include: { site: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    // Fallback: If no unassigned rosters found in narrow date range, query all unassigned rosters without date constraint
    if (unassignedRosters.length === 0) {
      const fallbackWhere: any = {
        OR: [
          { guardId: null },
          { guardId: '' },
          { status: 'Unassigned' }
        ]
      };
      if (siteId) fallbackWhere.siteId = String(siteId);

      unassignedRosters = await (prisma as any).siteRoster.findMany({
        where: fallbackWhere,
        include: { site: true },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 100
      });
    }

    if (unassignedRosters.length === 0) {
      res.json({ success: true, recommendations: [], count: 0, message: 'No unassigned shift slots found.' });
      return;
    }

    let allGuards = await (prisma as any).guard.findMany({
      where: {
        NOT: {
          status: { in: ['On Leave', 'ON_LEAVE', 'Inactive', 'INACTIVE', 'Suspended', 'SUSPENDED'] }
        }
      },
      include: { agency: true }
    });

    if (allGuards.length === 0) {
      allGuards = await (prisma as any).guard.findMany({
        include: { agency: true }
      });
    }

    const existingAssignedRosters = await (prisma as any).siteRoster.findMany({
      where: {
        date: { gte: start, lte: end },
        guardId: { not: null },
        status: { notIn: ['Unassigned', 'Cancelled'] }
      }
    });

    const guardSimulatedShifts: { [guardId: string]: number } = {};
    const guardDailyAssignments: { [guardId_dateIso: string]: boolean } = {};

    existingAssignedRosters.forEach((r: any) => {
      if (r.guardId && r.date) {
        const gId = String(r.guardId);
        const dateIso = safeIsoDate(r.date);
        if (dateIso) {
          guardSimulatedShifts[gId] = (guardSimulatedShifts[gId] || 0) + 1;
          guardDailyAssignments[`${gId}_${dateIso}`] = true;
        }
      }
    });

    const recommendations: any[] = [];

    for (const r of unassignedRosters) {
      const dateIso = safeIsoDate(r.date) || new Date().toISOString().split('T')[0];
      const startHour = parseInt((r.startTime || '08:00').split(':')[0], 10);
      const isNightShift = startHour >= 18 || startHour < 6;

      let scoredGuards: any[] = [];

      for (const g of allGuards) {
        const gId = String(g.id);
        const key = `${gId}_${dateIso}`;
        const alreadyWorking = guardDailyAssignments[key];

        let score = 0;
        const rationale: string[] = [];
        let isEligible = true;
        let disqualificationReason = '';

        // 1. Availability / Legal 1 Shift/Day Limit Check (HARD RESTRICTION)
        if (alreadyWorking) {
          isEligible = false;
          disqualificationReason = 'Legally Restricted: Max 1 Shift/Day';
          rationale.push('Disqualified: Max 1 Shift/Day Reached');
        }

        // 2. Strict Shift Preference Match (HARD RESTRICTION FOR PREFERENCE CONFLICTS)
        const pref = (g.shiftPreference || 'Flexible').toLowerCase();
        let isPrefMismatch = false;

        if (pref.includes('day') && isNightShift) {
          isEligible = false;
          disqualificationReason = 'Ineligible: Day Preference Guard on Night Shift';
          rationale.push('Disqualified: Day-Only Guard');
          isPrefMismatch = true;
        } else if (pref.includes('night') && !isNightShift) {
          isEligible = false;
          disqualificationReason = 'Ineligible: Night Preference Guard on Day Shift';
          rationale.push('Disqualified: Night-Only Guard');
          isPrefMismatch = true;
        } else if ((pref.includes('day') && !isNightShift) || (pref.includes('night') && isNightShift)) {
          score += 40;
          rationale.push(`Shift Preference Match (${isNightShift ? 'Night' : 'Day'})`);
        } else {
          score += 30;
          rationale.push('Flexible Availability');
        }

        // 3. Rest Interval Protection (HARD RESTRICTION FOR CONSECUTIVE NIGHT/DAY SHIFTS)
        if (r.date) {
          const prevDay = new Date(r.date);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevDateIso = safeIsoDate(prevDay);
          if (prevDateIso && guardDailyAssignments[`${gId}_${prevDateIso}`]) {
            if (!isNightShift && startHour < 12) {
              isEligible = false;
              disqualificationReason = 'Ineligible: Mandatory 12-Hour Rest Buffer Violation';
              rationale.push('Disqualified: Insufficient Rest Interval');
            } else {
              score += 10;
              rationale.push('Rest Interval Caution');
            }
          } else {
            score += 20;
            rationale.push('Rest Period Protected');
          }
        } else {
          score += 15;
        }

        // 4. Workload Balancing (+30 pts max)
        const currentCount = guardSimulatedShifts[gId] || 0;
        if (currentCount === 0) {
          score += 30;
          rationale.push('Optimal Workload (0 prior shifts)');
        } else if (currentCount === 1) {
          score += 25;
          rationale.push('Balanced Workload (1 prior shift)');
        } else if (currentCount <= 3) {
          score += 20;
          rationale.push('Moderate Workload');
        } else {
          score += 10;
        }

        // 5. Base Continuity
        score += 10;

        scoredGuards.push({
          guardId: gId,
          guardName: `${g.firstName} ${g.lastName}`.trim() || g.guardId,
          guardCode: g.guardId,
          agencyName: g.agency?.name || 'Direct Guard',
          shiftPreference: g.shiftPreference || 'Flexible',
          isPreferenceMismatch: isPrefMismatch,
          isEligible,
          disqualificationReason,
          matchScore: isEligible ? Math.max(10, Math.min(100, score)) : 0,
          rationale
        });
      }

      // Filter eligible guards only for system recommendation
      const eligibleGuards = scoredGuards.filter(sg => sg.isEligible);
      eligibleGuards.sort((a, b) => b.matchScore - a.matchScore);
      scoredGuards.sort((a, b) => b.matchScore - a.matchScore);

      const topGuard = eligibleGuards[0] || null;
      let isStaffShortage = !topGuard;

      if (topGuard) {
        guardSimulatedShifts[topGuard.guardId] = (guardSimulatedShifts[topGuard.guardId] || 0) + 1;
        guardDailyAssignments[`${topGuard.guardId}_${dateIso}`] = true;
      }

      const timingStr = r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : '08:00 - 20:00';
      const siteName = r.site?.name || 'Contract Site';

      recommendations.push({
        rosterId: r.id,
        siteId: r.siteId,
        siteName,
        date: dateIso,
        startTime: r.startTime || '08:00',
        endTime: r.endTime || '20:00',
        timing: timingStr,
        shiftLabel: r.shiftLabel || timingStr,
        isStaffShortage,
        status: isStaffShortage ? 'UNASSIGNED - NO ELIGIBLE GUARDS' : (r.status || 'Unassigned'),
        recommendedGuard: isStaffShortage ? null : topGuard,
        alternativeGuards: eligibleGuards.slice(isStaffShortage ? 0 : 1, 5),
        allScoredGuards: scoredGuards
      });
    }

    res.json({ success: true, recommendations, count: recommendations.length });
  } catch (err: any) {
    console.error('Auto-Schedule Error:', err);
    res.status(500).json({ error: err?.message || 'Failed to compute auto-schedule suggestions' });
  }
});

router.put('/assign-batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId, startDate, endDate, guardId, startTime, endTime } = req.body;
    if (!siteId || !startDate || !endDate || !guardId) {
      res.status(400).json({ error: 'siteId, startDate, endDate, and guardId are required' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const where: any = {
      siteId: String(siteId),
      date: { gte: start, lte: end }
    };
    if (startTime) where.startTime = startTime;
    if (endTime) where.endTime = endTime;

    const rosters = await (prisma as any).siteRoster.findMany({ where });

    let updatedCount = 0;
    const errors: string[] = [];

    for (const r of rosters) {
      const overlappingDailyCount = await (prisma as any).siteRoster.count({
        where: {
          guardId: String(guardId),
          date: r.date,
          id: { not: r.id }
        }
      });

      if (overlappingDailyCount >= 1) {
        errors.push(`Guard already assigned on ${r.date ? r.date.toISOString().split('T')[0] : 'date'}`);
        continue;
      }

      await (prisma as any).siteRoster.update({
        where: { id: r.id },
        data: { guardId: String(guardId), status: 'Scheduled' }
      });
      updatedCount++;
    }

    res.json({ success: true, updatedCount, skippedCount: errors.length, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to batch assign guard' });
  }
});

router.put('/assign/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const rosterId = String(req.params.id);
    const { guardId, patrolPathId } = req.body;

    const roster = await prisma.siteRoster.findUnique({ where: { id: rosterId } });
    if (!roster) {
      res.status(404).json({ error: 'Roster not found' });
      return;
    }
    
    if (guardId) {
      const overlappingDailyCount = await prisma.siteRoster.count({
        where: {
          guardId: String(guardId),
          date: roster.date,
          id: { not: rosterId }
        }
      });

      if (overlappingDailyCount >= 1) {
        res.status(400).json({ error: 'Strict Limit Reached: Guard is legally restricted to a maximum of 1 shift per day.' });
        return;
      }
    }

    const dataToUpdate: any = {};
    if (guardId !== undefined) dataToUpdate.guardId = guardId ? String(guardId) : null;
    if (patrolPathId !== undefined) dataToUpdate.patrolPathId = patrolPathId ? String(patrolPathId) : null;

    const updated = await prisma.siteRoster.update({
      where: { id: rosterId },
      data: dataToUpdate
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign shift' });
  }
});

router.post('/log-absence', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rosterId, date, reason } = req.body;
    if (!rosterId) {
      res.status(400).json({ error: 'rosterId is required' });
      return;
    }

    const roster = await (prisma as any).siteRoster.findUnique({
      where: { id: String(rosterId) },
      include: { guard: true, site: true }
    });

    if (!roster) {
      res.status(404).json({ error: 'Shift schedule not found' });
      return;
    }

    const exceptionDate = date ? new Date(date) : (roster.date || new Date());

    // Create shift exception for absence
    const exception = await (prisma as any).shiftException.create({
      data: {
        rosterId: roster.id,
        date: exceptionDate,
        type: 'Absent',
        notes: reason || 'Guard absent - Client notification / Admin override'
      }
    });

    // Update roster status to NEEDS REPLACEMENT
    const updatedRoster = await (prisma as any).siteRoster.update({
      where: { id: roster.id },
      data: { status: 'NEEDS REPLACEMENT' }
    });

    res.json({
      success: true,
      message: 'Guard absence logged. Shift flagged as NEEDS REPLACEMENT.',
      exception,
      roster: updatedRoster
    });
  } catch (err: any) {
    console.error('Log Absence Error:', err);
    res.status(500).json({ error: err?.message || 'Failed to log absence' });
  }
});

router.get('/replacement-suggestions/:rosterId', async (req: Request, res: Response): Promise<void> => {
  try {
    const rosterId = String(req.params.rosterId);
    const roster = await (prisma as any).siteRoster.findUnique({
      where: { id: rosterId },
      include: { site: true, guard: true }
    });

    if (!roster) {
      res.status(404).json({ error: 'Roster not found' });
      return;
    }

    const dateIso = roster.date ? roster.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const startHour = parseInt((roster.startTime || '08:00').split(':')[0], 10);
    const isNightShift = startHour >= 18 || startHour < 6;

    // Fetch all active guards except currently assigned guard
    const availableGuards = await (prisma as any).guard.findMany({
      where: {
        id: { not: roster.guardId || '' },
        NOT: {
          status: { in: ['On Leave', 'ON_LEAVE', 'Inactive', 'INACTIVE', 'Suspended', 'SUSPENDED'] }
        }
      },
      include: { agency: true }
    });

    const suggestions = availableGuards.map((g: any) => {
      let score = 0;
      const rationale: string[] = [];
      const pref = (g.shiftPreference || 'Flexible').toLowerCase();
      let isPrefMismatch = false;

      if ((pref.includes('day') && !isNightShift) || (pref.includes('night') && isNightShift)) {
        score += 40;
        rationale.push(`Matches Shift Preference (${isNightShift ? 'Night' : 'Day'})`);
      } else if (pref.includes('flexible') || !g.shiftPreference) {
        score += 30;
        rationale.push('Flexible Shift Preference');
      } else {
        score += 10;
        isPrefMismatch = true;
        rationale.push(`Preference Warning: ${g.shiftPreference} Guard on ${isNightShift ? 'Night' : 'Day'} Shift`);
      }

      score += 30; // Standby / Replacement Readiness
      rationale.push('Active Backup Guard');

      return {
        guardId: g.id,
        guardCode: g.guardId,
        guardName: `${g.firstName} ${g.lastName}`.trim(),
        agencyName: g.agency?.name || 'In-House',
        shiftPreference: g.shiftPreference || 'Flexible',
        isPreferenceMismatch: isPrefMismatch,
        matchScore: Math.min(100, score),
        rationale
      };
    });

    suggestions.sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.json({
      rosterId,
      siteName: roster.site?.name || 'Contract Site',
      date: dateIso,
      shiftTiming: `${roster.startTime} - ${roster.endTime}`,
      suggestions: suggestions.slice(0, 5)
    });
  } catch (err: any) {
    console.error('Replacement Suggestions Error:', err);
    res.status(500).json({ error: 'Failed to fetch replacement suggestions' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.siteRoster.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: 'Failed to delete roster' });
  }
});

export default router;
