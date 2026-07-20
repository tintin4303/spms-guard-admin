import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  // TODO: Implement JWT generation based on User lookup
  res.json({ token: 'dummy_token', role: 'ADMIN' });
});

export default router;
