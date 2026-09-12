import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user: any = null;
    if (token) {
      try { user = jwt.verify(token, JWT_SECRET); } catch (e) { }
    }

    const { siteId, agencyId } = req.query;
    
    let guardWhere: any = agencyId ? { agencyId: String(agencyId) } : {};
    let siteWhere: any = siteId ? { id: String(siteId) } : {};

    if (user?.role === 'AGENCY_MANAGER') {
       guardWhere = { ...guardWhere, agencyId: user.managedAgencyId };
    }
    if (user?.role === 'CLIENT') {
       siteWhere = { ...siteWhere, contract: { clientId: user.userId } };
    }

    const rosters = await prisma.siteRoster.findMany({
      where: { 
        guard: guardWhere,
        site: { ...siteWhere }
      },
      include: {
        guard: true,
        site: {
          include: {
            contract: true
          }
        },
        exceptions: {
          include: {
            replacementGuard: true
          }
        }
      }
    });

    const schedules = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < 7; i++) {
       const targetDate = new Date(today);
       targetDate.setDate(targetDate.getDate() + i);
       const dateStr = targetDate.toISOString().split('T')[0];

       for (const r of rosters) {
          const ex = r.exceptions.find((e: any) => new Date(e.date).toISOString().split('T')[0] === dateStr);
          
          let status = 'Scheduled (Permanent)';
          let activeGuard: any = r.guard;
          
          if (ex) {
             if (ex.type === 'Absent') {
                 status = 'Absent (Uncovered)';
                 activeGuard = { firstName: 'UNCOVERED', lastName: 'SHIFT', guardId: '!!!' };
             } else if (ex.type === 'Swap') {
                 status = 'Swap Replacement';
                 activeGuard = ex.replacementGuard || { firstName: 'Temp', lastName: 'Guard', guardId: 'TMP' };
             }
          }

          schedules.push({
             id: ex ? `ex_${ex.id}` : `ros_${r.id}_${dateStr}`,
             rosterId: r.id,
             date: new Date(targetDate).toISOString(), // Full ISO string for frontend date parsing
             startTime: r.startTime,
             endTime: r.endTime,
             shiftLabel: `${dateStr}, ${r.startTime} - ${r.endTime}`,
             guard: activeGuard,
             site: r.site,
             status
          });
       }
    }
    
    // Sort chronologically by date then startTime
    schedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
    
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patterned schedules' });
  }
});

// Create Permanent Site Roster
router.post('/roster', async (req, res) => {
  try {
    const { startTime, endTime, guardId, siteId } = req.body;
    
    // Simplistic overlap and warning checks could go here
    const roster = await prisma.siteRoster.create({
      data: {
        shiftLabel: 'Standard Shift',
        startTime,
        endTime,
        guardId,
        siteId
      }
    });
    res.json(roster);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create permanent roster' });
  }
});

// Delete Permanent Roster
router.delete('/roster/:id', async (req, res) => {
  try {
    await prisma.siteRoster.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: 'Failed to delete roster' });
  }
});

// Log an Exception (Absence / Swap)
router.post('/exception', async (req, res) => {
  try {
    const { date, type, rosterId, replacementGuardId } = req.body;
    const shiftDate = new Date(date);
    
    const exception = await prisma.shiftException.create({
      data: {
        date: shiftDate,
        type,
        rosterId,
        replacementGuardId: replacementGuardId || null
      }
    });
    res.json(exception);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log exception' });
  }
});

export default router;
