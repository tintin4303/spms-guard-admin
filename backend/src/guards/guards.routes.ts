import { Router } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export function unpackSkills(skillsRaw: any) {
  let gender = 'Not Specified';
  let skills: string[] = [];

  if (skillsRaw) {
    let parsed = skillsRaw;
    if (typeof skillsRaw === 'string') {
      try { parsed = JSON.parse(skillsRaw); } catch { parsed = []; }
    }

    if (Array.isArray(parsed)) {
      skills = parsed;
      const genderTag = parsed.find((s: string) => typeof s === 'string' && s.startsWith('Gender: '));
      if (genderTag) {
        gender = genderTag.replace('Gender: ', '').trim();
        skills = parsed.filter((s: string) => s !== genderTag);
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      gender = parsed.gender || 'Not Specified';
      skills = Array.isArray(parsed.items) ? parsed.items : (Array.isArray(parsed.skills) ? parsed.skills : []);
    }
  }

  return { gender, skills };
}

export function packSkills(gender?: string, skills?: any) {
  const g = gender && typeof gender === 'string' && gender.trim() ? gender.trim() : 'Not Specified';
  let sList: string[] = [];
  if (Array.isArray(skills)) {
    sList = skills;
  } else if (typeof skills === 'string') {
    try {
      const p = JSON.parse(skills);
      sList = Array.isArray(p) ? p : [skills];
    } catch {
      sList = skills ? [skills] : [];
    }
  }
  return {
    gender: g,
    items: sList
  };
}

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

    const guards = await prisma.guard.findMany({
      where,
      include: { agency: { select: { name: true } }, user: { select: { id: true, email: true } } },
      orderBy: { guardId: 'asc' }
    });

    if (user?.role === 'CLIENT') {
      const strippedGuards = guards.map(g => {
        const { gender } = unpackSkills(g.skills);
        return {
          id: g.id,
          guardId: g.guardId,
          firstName: g.firstName,
          lastName: g.lastName ? g.lastName.charAt(0) + '.' : '',
          status: g.status,
          gender
        };
      });
      return res.json(strippedGuards);
    }

    const mappedGuards = guards.map(g => {
      const { gender, skills } = unpackSkills(g.skills);
      return {
        ...g,
        gender,
        skills
      };
    });

    res.json(mappedGuards);
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

    const { firstName, lastName, guardId, certificateNumber, shiftPreference, status, contactNumber, certificationExpiry, skills, gender } = req.body;
    
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
        skills: packSkills(gender, skills),
        source,
        agencyId
      }
    });

    const unpacked = unpackSkills(guard.skills);
    res.json({
      ...guard,
      gender: unpacked.gender,
      skills: unpacked.skills
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create guard' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, guardId, certificateNumber, shiftPreference, status, contactNumber, certificationExpiry, skills, gender } = req.body;

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
        skills: packSkills(gender, skills)
      }
    });

    const unpacked = unpackSkills(updated.skills);
    res.json({
      ...updated,
      gender: unpacked.gender,
      skills: unpacked.skills
    });
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

router.post('/:id/provision', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    const guard = await prisma.guard.findUnique({ where: { id } });
    if (!guard) return res.status(404).json({ error: 'Guard not found' });
    if (guard.userId) return res.status(400).json({ error: 'Guard already provisioned' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${guard.firstName} ${guard.lastName}`;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'GUARD',
        guardProfile: {
          connect: { id: guard.id }
        }
      }
    });

    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to provision guard' });
  }
});

export default router;
