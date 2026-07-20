import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Quick auto-registration for prototype usability if account doesn't exist
    let user = await prisma.user.findUnique({ where: { email } });
    
    let targetRole = 'CLIENT';
    if(email.toLowerCase().includes('admin')) targetRole = 'ADMIN';
    else if(email.toLowerCase().includes('agency') || email.toLowerCase().includes('manager')) targetRole = 'AGENCY_MANAGER';
    else if(email.toLowerCase().includes('ops')) targetRole = 'OPERATION_MANAGER';
    
    if (!user) {
       user = await prisma.user.create({ 
         data: { email, name: email.split('@')[0], role: targetRole as any } 
       });
    } else if (user.role !== targetRole) {
       // Force sync prototype accounts so older db instances are corrected
       user = await prisma.user.update({
         where: { email },
         data: { role: targetRole as any }
       });
    }
    
    res.json({ token: 'mock-jwt-token-748923', user });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
