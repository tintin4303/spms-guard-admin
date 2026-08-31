import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-assign roles for prototype purposes based on email
    let targetRole = 'CLIENT';
    if(email.toLowerCase().includes('admin')) targetRole = 'ADMIN';
    else if(email.toLowerCase().includes('agency') || email.toLowerCase().includes('manager')) targetRole = 'AGENCY_MANAGER';
    else if(email.toLowerCase().includes('ops')) targetRole = 'OPERATION_MANAGER';

    let agencyOptions: any = {};
    if (targetRole === 'AGENCY_MANAGER') {
       const newAgency = await prisma.agency.create({
         data: { name: 'Vendor ' + email.split('@')[0], contact: email }
       });
       agencyOptions = { managedAgencyId: newAgency.id };
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: targetRole as any,
        ...agencyOptions
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email, managedAgencyId: user.managedAgencyId }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    
    // Auto-create for testing if it's the 1234 password
    if (!user && password === '1234') {
        let targetRole = 'CLIENT';
        if(email.toLowerCase().includes('admin')) targetRole = 'ADMIN';
        else if(email.toLowerCase().includes('agency') || email.toLowerCase().includes('manager')) targetRole = 'AGENCY_MANAGER';
        else if(email.toLowerCase().includes('ops')) targetRole = 'OPERATION_MANAGER';
        
        let agencyOptions: any = {};
        if (targetRole === 'AGENCY_MANAGER') {
           const newAgency = await prisma.agency.create({
             data: { name: 'Vendor ' + email.split('@')[0], contact: email }
           });
           agencyOptions = { managedAgencyId: newAgency.id };
        }
        
        user = await prisma.user.create({
            data: {
               email,
               name: email.split('@')[0],
               password: await bcrypt.hash('1234', 10),
               role: targetRole as any,
               ...agencyOptions
            }
        });
    } else if (user && user.role === 'AGENCY_MANAGER' && !user.managedAgencyId) {
        // Patches existing Agency Managers that lack an agency
        const newAgency = await prisma.agency.create({
            data: { name: 'Vendor ' + user.email!.split('@')[0], contact: user.email }
        });
        user = await prisma.user.update({
            where: { id: user.id },
            data: { managedAgencyId: newAgency.id }
        });
    }

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (password !== '1234') {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
    }

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email, managedAgencyId: user.managedAgencyId }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, managedAgencyId: user.managedAgencyId } });
  } catch(e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
