import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const guards = await prisma.guard.findMany();
    res.json(guards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guards' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, guardId, certificateNumber, shiftPreference, status, contactNumber, certificationExpiry, skills } = req.body;
    const guard = await prisma.guard.create({
      data: {
        firstName,
        lastName,
        guardId,
        certificateNumber,
        shiftPreference,
        status: status || 'Active',
        contactNumber,
        certificationExpiry: certificationExpiry ? new Date(certificationExpiry) : null,
        skills: skills ? JSON.stringify(skills) : null
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
        certificationExpiry: certificationExpiry ? new Date(certificationExpiry) : null,
        skills: skills ? JSON.stringify(skills) : null
      }
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
