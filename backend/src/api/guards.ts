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

    let where: any = {};
    if (user?.role === 'CLIENT') {
      where = {
        rosters: { some: { site: { contract: { clientId: user.userId } } } }
      };
    } else if (user?.role === 'AGENCY_MANAGER') {
      if (!user.managedAgencyId) return res.json([]);
      where = { agencyId: user.managedAgencyId };
    } else if (user?.role === 'OPERATION_MANAGER') {
      where = {
        OR: [
          { source: 'IN_HOUSE' },
          { source: 'AGENCY', isVisibleToOps: true }
        ]
      };
    }

    // When returning to client, strip sensitive info, but here we can just query all and pick what we send back or leave stripping to the frontend (though backend stripping is safer).
    // Let's strip in the response map if CLIENT.
    const guards = await prisma.guard.findMany({
      where,
      include: { agency: { select: { name: true } } }
    });

    if (user?.role === 'CLIENT') {
      const strippedGuards = guards.map(g => ({
        id: g.id,
        guardId: g.guardId,
        firstName: g.firstName,
        lastName: g.lastName ? g.lastName.charAt(0) + '.' : '',
        status: g.status,
      }));
      return res.json(strippedGuards);
    }

    res.json(guards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guards' });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user: any = null;
    if (token) {
      try { user = jwt.verify(token, JWT_SECRET); } catch (e) { }
    }

    const { firstName, lastName, guardId, certificateNumber, shiftPreference, status, contactNumber, certificationExpiry, skills } = req.body;
    
    let source = "IN_HOUSE";
    let agencyId = null;
    
    if (user?.role === 'AGENCY_MANAGER') {
      source = "AGENCY";
      agencyId = user.managedAgencyId;
    }

    const guard = await prisma.guard.create({
      data: {
        firstName,
        lastName,
        guardId,
        certificateNumber,
        shiftPreference,
        status: status || 'Active',
        contactNumber,
        certificationExpiry: certificationExpiry ? new Date(certificationExpiry) : undefined,
        skills: skills ? JSON.stringify(skills) : undefined,
        source,
        agencyId
      }
    });
    res.json(guard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create guard' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, guardId, certificateNumber, shiftPreference, status, contactNumber, certificationExpiry, skills } = req.body;

    // If status is changed to "On Leave", we need to flag upcoming assignments for reassignment
    // NOTE: GuardAssignment doesn't exist in the current schema. You'd need to log a ShiftException.
    /*
    if (status === 'On Leave') {
       await prisma.guardAssignment.updateMany({
         where: {
           guardId: id,
           status: 'Scheduled',
           date: { gte: new Date() } // future assignments
         },
         data: {
           status: 'Pending Reassignment'
         }
       });
    }
    */

    const updated = await prisma.guard.update({
      where: { id },
      data: {
        firstName,
        lastName,
        guardId,
        certificateNumber,
        shiftPreference,
        status,
        contactNumber,
        certificationExpiry: certificationExpiry ? new Date(certificationExpiry) : undefined,
        skills: skills ? JSON.stringify(skills) : undefined
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update guard' });
  }
});

router.put('/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisibleToOps } = req.body;

    const updated = await prisma.guard.update({
      where: { id },
      data: { isVisibleToOps }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update guard' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.guard.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete guard' });
  }
});

export default router;
