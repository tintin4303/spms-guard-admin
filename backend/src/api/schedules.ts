import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const assignments = await prisma.guardAssignment.findMany({
      include: {
        guard: true,
        site: {
          include: {
            contract: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { shiftLabel, date, startTime, endTime, guardId, siteId } = req.body;
    
    // 1. Check Guard Certification Expiry and Status
    const guard = await prisma.guard.findUnique({ where: { id: guardId } });
    if (!guard) return res.status(404).json({ error: 'Guard not found' });
    
    if (guard.status === 'On Leave' || guard.status === 'Suspended') {
      return res.status(400).json({ error: `Cannot assign guard. Status is ${guard.status}` });
    }
    
    if (guard.certificationExpiry && new Date(guard.certificationExpiry) < new Date()) {
      return res.status(400).json({ error: 'Guard certification is expired' });
    }

    // 2. Check Double Booking
    const assignmentDate = new Date(date);
    const existingAssignments = await prisma.guardAssignment.findMany({
      where: {
        guardId,
        date: assignmentDate,
        status: { notIn: ['Completed', 'Missed', 'Pending Reassignment'] }
      }
    });

    const isOverlapping = existingAssignments.some(a => {
      // Simple overlap logic: assuming times don't cross midnight for this basic check
      return (startTime < a.endTime && endTime > a.startTime);
    });

    if (isOverlapping) {
      return res.status(400).json({ error: 'Guard is already booked for this time period' });
    }

    // 3. Shift Preference Warning
    let warning = null;
    if (guard.shiftPreference && guard.shiftPreference !== 'Flexible') {
       const isDayShift = parseInt(startTime.split(':')[0]) >= 6 && parseInt(startTime.split(':')[0]) < 18;
       if (guard.shiftPreference === 'Day' && !isDayShift) warning = "Shift mismatch: Guard prefers Day shifts.";
       if (guard.shiftPreference === 'Night' && isDayShift) warning = "Shift mismatch: Guard prefers Night shifts.";
    }

    const assignment = await prisma.guardAssignment.create({
      data: {
        shiftLabel,
        date: assignmentDate,
        startTime,
        endTime,
        status: 'Scheduled',
        guardId,
        siteId
      },
      include: {
        guard: true,
        site: {
          include: {
            contract: true
          }
        }
      }
    });
    res.json({ assignment, warning });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

export default router;
